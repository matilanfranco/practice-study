"use client";

import { useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { EXERCISE_CATEGORIES } from "@/lib/constants";
import { fmt } from "@/lib/helpers";

export default function ExerciseTracker({ elapsed, onUpdate }) {
  const { exercises } = useApp();
  const [expanded,  setExpanded]  = useState(null); // exercise id
  const [done,      setDone]      = useState({});   // { [id]: { bpm, startedAt, completedAt } }
  const [bpmInput,  setBpmInput]  = useState({});   // { [id]: string }
  const startTimes  = useRef({});

  const groupedExercises = EXERCISE_CATEGORIES
    .map(cat => ({
      ...cat,
      items: exercises.filter(e => e.category === cat.id),
    }))
    .filter(cat => cat.items.length > 0);

  const totalDone  = Object.keys(done).length;
  const totalExs   = exercises.length;

  const handleExpand = (id) => {
    setExpanded(x => x === id ? null : id);
    if (!startTimes.current[id]) {
      startTimes.current[id] = elapsed;
    }
  };

  const handleMarkDone = (ex) => {
    const bpm      = bpmInput[ex.id] ? parseInt(bpmInput[ex.id]) : null;
    const started  = startTimes.current[ex.id] ?? elapsed;
    const timeSpent = elapsed - started;
    const updated  = {
      ...done,
      [ex.id]: { bpm, startedAt: started, completedAt: elapsed, timeSpent },
    };
    setDone(updated);
    setExpanded(null);
    onUpdate(updated);
  };

  const handleUnmark = (id) => {
    const updated = { ...done };
    delete updated[id];
    setDone(updated);
    onUpdate(updated);
  };

  if (exercises.length === 0) return (
    <div style={{ padding: "24px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>💪</div>
      <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
        No exercises yet.<br />Add them from the dashboard.
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Progress header */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Exercises</span>
          <span style={{ fontSize: 12, color: totalDone > 0 ? "var(--primary)" : "var(--faint)", fontWeight: 600 }}>
            {totalDone} / {totalExs} done
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
          <div style={{
            height: "100%", borderRadius: 2, background: "var(--primary)",
            width: `${totalExs > 0 ? (totalDone / totalExs) * 100 : 0}%`,
            transition: "width 0.4s ease",
          }} />
        </div>
      </div>

      {/* Exercise list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 12px" }}>
        {groupedExercises.map(cat => (
          <div key={cat.id} style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 11, color: "var(--faint)", fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase",
              marginBottom: 6, padding: "0 4px",
            }}>
              {cat.emoji} {cat.label}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {cat.items.map(ex => {
                const isDone    = !!done[ex.id];
                const isOpen    = expanded === ex.id;
                const exDone    = done[ex.id];

                return (
                  <div key={ex.id} style={{ borderRadius: 12, overflow: "hidden", border: `1.5px solid ${isDone ? "var(--primary)" : isOpen ? "var(--primary-xl)" : "var(--border)"}`, transition: "all 0.2s" }}>
                    {/* Exercise row */}
                    <button
                      onClick={() => isDone ? handleUnmark(ex.id) : handleExpand(ex.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%",
                        padding: "10px 12px", cursor: "pointer", textAlign: "left",
                        background: isDone ? "var(--primary-bg)" : isOpen ? "#F0F6FB" : "white",
                        border: "none", fontFamily: "DM Sans, sans-serif", transition: "background 0.2s",
                      }}
                    >
                      {/* Status icon */}
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                        border: isDone ? "none" : `2px solid ${isOpen ? "var(--primary)" : "var(--border)"}`,
                        background: isDone ? "var(--primary)" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s",
                      }}>
                        {isDone && <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 500,
                          color: isDone ? "var(--primary)" : "var(--text)",
                          textDecoration: isDone ? "line-through" : "none",
                          opacity: isDone ? 0.8 : 1,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {ex.name}
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
                          {isDone && exDone.bpm && (
                            <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600 }}>
                              {exDone.bpm} BPM
                            </span>
                          )}
                          {isDone && exDone.timeSpent > 0 && (
                            <span style={{ fontSize: 11, color: "var(--faint)" }}>
                              {fmt(exDone.timeSpent)}
                            </span>
                          )}
                          {!isDone && ex.lastBpm && (
                            <span style={{ fontSize: 11, color: "var(--faint)" }}>
                              Last: {ex.lastBpm} BPM
                            </span>
                          )}
                          {!isDone && ex.avgBpm && ex.timesPlayed > 1 && (
                            <span style={{ fontSize: 11, color: "var(--faint)" }}>
                              Avg: {ex.avgBpm} BPM
                            </span>
                          )}
                          {!isDone && ex.lastRating && (
                            <span style={{ fontSize: 11, color: "var(--faint)" }}>
                              {"★".repeat(ex.lastRating)}{"☆".repeat(5 - ex.lastRating)}
                            </span>
                          )}
                        </div>
                      </div>

                      <span style={{ fontSize: 14, color: "var(--faint)", flexShrink: 0 }}>
                        {isDone ? "↩" : isOpen ? "▾" : "▸"}
                      </span>
                    </button>

                    {/* Expanded: BPM input + done button */}
                    {isOpen && !isDone && (
                      <div className="fade-in" style={{
                        padding: "10px 12px 12px",
                        background: "#F0F6FB",
                        borderTop: "1px solid var(--primary-xl)",
                      }}>
                        {ex.description && (
                          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10, lineHeight: 1.4 }}>
                            {ex.description}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600, marginBottom: 5 }}>
                              BPM today
                            </div>
                            <input
                              type="number"
                              placeholder={ex.lastBpm ? `Last: ${ex.lastBpm}` : "e.g. 120"}
                              value={bpmInput[ex.id] || ""}
                              onChange={e => setBpmInput(p => ({ ...p, [ex.id]: e.target.value }))}
                              style={{
                                width: "100%", padding: "8px 10px", borderRadius: 8,
                                border: "1.5px solid var(--primary-xl)", background: "white",
                                fontSize: 14, fontFamily: "DM Sans, sans-serif",
                                color: "var(--text)", outline: "none",
                              }}
                            />
                          </div>
                          <button
                            onClick={() => handleMarkDone(ex)}
                            style={{
                              padding: "8px 16px", borderRadius: 10, border: "none",
                              background: "var(--primary)", color: "white",
                              cursor: "pointer", fontSize: 13, fontWeight: 600,
                              fontFamily: "DM Sans, sans-serif", marginTop: 18,
                              whiteSpace: "nowrap",
                            }}
                          >
                            ✓ Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}