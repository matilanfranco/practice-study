"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { CATEGORIES, PDF_LIST, EXERCISE_CATEGORIES } from "@/lib/constants";
import { fmt } from "@/lib/helpers";
import StarRating from "@/components/ui/StarRating";

export default function BlockLog({ elapsed, blockNum, notes: timerNotes = [], onConfirm }) {
  const { exercises, recordExerciseSession } = useApp();

  const [categories,    setCategories]   = useState([]);
  const [description,   setDescription]  = useState("");
  const [focus,         setFocus]        = useState(0);
  const [dexterity,     setDexterity]    = useState(0);
  const [notes,         setNotes]        = useState(
    timerNotes.map(n => `[${fmt(n.time)}] ${n.text}`).join("\n")
  );
  const [usedPdf,       setUsedPdf]      = useState(null);
  const [selectedPdfs,  setSelectedPdfs] = useState([]);

  // Exercise selection + BPM/rating per exercise
  const [selectedExs,   setSelectedExs]  = useState([]); // array of exercise ids
  const [exStats,       setExStats]      = useState({}); // { [id]: { bpm, rating } }

  const toggleCategory = id =>
    setCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const togglePdf = id =>
    setSelectedPdfs(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const toggleExercise = id =>
    setSelectedExs(prev => {
      if (prev.includes(id)) {
        const n = { ...exStats };
        delete n[id];
        setExStats(n);
        return prev.filter(e => e !== id);
      }
      return [...prev, id];
    });

  const setExStat = (id, key, val) =>
    setExStats(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: val } }));

  const handleConfirm = async () => {
    if (!categories.length) return;

    // Record stats for each selected exercise
    for (const id of selectedExs) {
      const stats = exStats[id] || {};
      if (stats.bpm || stats.rating) {
        await recordExerciseSession(id, {
          bpm:    stats.bpm    ? parseInt(stats.bpm)    : null,
          rating: stats.rating ? parseInt(stats.rating) : null,
        });
      }
    }

    onConfirm({
      categories, description, focus, dexterity, notes, duration: elapsed,
      usedPdf: usedPdf === true,
      pdfsUsed: usedPdf === true ? selectedPdfs : [],
      exercises: selectedExs,
      exerciseStats: exStats,
    });
  };

  const groupedExercises = EXERCISE_CATEGORIES
    .map(cat => ({
      ...cat,
      items: exercises.filter(e => e.category === cat.id),
    }))
    .filter(cat => cat.items.length > 0);

  return (
    <div style={{ padding: "44px 22px 40px", overflowY: "auto" }} className="slide-up">
      {/* Header */}
      <div style={{ marginBottom: 26 }}>
        <div style={eyebrow}>Block {blockNum} complete</div>
        <h2 className="serif" style={{ fontSize: 34, color: "var(--text)", marginBottom: 12 }}>
          What did you<br />work on?
        </h2>
        <div className="badge badge-green" style={{ display: "inline-flex" }}>
          <span style={{ fontSize: 16 }}>⏱</span>
          <span className="serif" style={{ fontSize: 17 }}>{fmt(elapsed)}</span>
          <span style={{ fontSize: 12 }}>studied</span>
        </div>
      </div>

      {/* Category */}
      <div style={{ marginBottom: 22 }}>
        <div style={fieldLabel}>
          Category{" "}
          <span style={{ color: "var(--faint)", fontWeight: 400 }}>(select all that apply)</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button key={c.id} className={`chip ${categories.includes(c.id) ? "active" : ""}`} onClick={() => toggleCategory(c.id)}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
        {categories.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--primary)", fontWeight: 500 }}>
            {categories.map(id => CATEGORIES.find(c => c.id === id)?.label).join(" · ")}
          </div>
        )}
      </div>

      {/* Exercises */}
      {exercises.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={fieldLabel}>
            Exercises practiced{" "}
            <span style={{ color: "var(--faint)", fontWeight: 400 }}>(optional)</span>
          </div>
          {groupedExercises.map(cat => (
            <div key={cat.id} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginBottom: 7 }}>
                {cat.emoji} {cat.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {cat.items.map(ex => {
                  const on    = selectedExs.includes(ex.id);
                  const stats = exStats[ex.id] || {};
                  return (
                    <div key={ex.id}>
                      <button
                        onClick={() => toggleExercise(ex.id)}
                        style={{
                          display: "flex", alignItems: "flex-start", gap: 10, width: "100%",
                          padding: "10px 12px", borderRadius: on ? "10px 10px 0 0" : 10,
                          cursor: "pointer", textAlign: "left",
                          fontFamily: "DM Sans, sans-serif", transition: "all 0.15s",
                          border:     on ? "1.5px solid var(--primary)"  : "1.5px solid var(--border)",
                          borderBottom: on ? "none" : undefined,
                          background: on ? "var(--primary-bg)" : "white",
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                          border: on ? "none" : "1.5px solid var(--border)",
                          background: on ? "var(--primary)" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {on && <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>✓</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: on ? "var(--primary)" : "var(--text)" }}>
                            {ex.name}
                          </div>
                          {ex.description && (
                            <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2 }}>{ex.description}</div>
                          )}
                          <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
                            {ex.lastBpm && (
                              <span style={{ fontSize: 11, color: "var(--faint)" }}>Last: {ex.lastBpm} BPM</span>
                            )}
                            {ex.avgBpm && ex.timesPlayed > 1 && (
                              <span style={{ fontSize: 11, color: "var(--faint)" }}>Avg: {ex.avgBpm} BPM</span>
                            )}
                            {ex.lastRating && (
                              <span style={{ fontSize: 11, color: "var(--faint)" }}>
                                Last: {"★".repeat(ex.lastRating)}{"☆".repeat(5 - ex.lastRating)}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* BPM + rating inline when selected */}
                      {on && (
                        <div className="fade-in" style={{
                          padding: "10px 12px", borderRadius: "0 0 10px 10px",
                          background: "var(--primary-bg)", border: "1.5px solid var(--primary)",
                          borderTop: "1px solid var(--primary-xl)",
                          display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 500, whiteSpace: "nowrap" }}>BPM</span>
                            <input
                              type="number"
                              placeholder={ex.lastBpm || "—"}
                              value={stats.bpm || ""}
                              onChange={e => setExStat(ex.id, "bpm", e.target.value)}
                              style={{
                                width: 70, padding: "5px 8px", borderRadius: 8,
                                border: "1.5px solid var(--primary-xl)", background: "white",
                                fontSize: 13, fontFamily: "DM Sans, sans-serif", color: "var(--text)",
                                outline: "none",
                              }}
                            />
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 500 }}>Rating</span>
                            <div style={{ display: "flex", gap: 2 }}>
                              {[1,2,3,4,5].map(n => (
                                <span
                                  key={n}
                                  onClick={() => setExStat(ex.id, "rating", n)}
                                  style={{
                                    fontSize: 20, cursor: "pointer",
                                    color: n <= (stats.rating || 0) ? "var(--primary)" : "var(--border)",
                                    transition: "color 0.1s",
                                  }}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
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
      )}

      {/* Description */}
      <div style={{ marginBottom: 22 }}>
        <div style={fieldLabel}>General notes</div>
        <textarea
          className="input" rows={3}
          placeholder="e.g. C major scale in thirds, chromatic at 80 BPM..."
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <StarRating value={focus}     onChange={setFocus}     label="Focus level" />
      <StarRating value={dexterity} onChange={setDexterity} label="Dexterity / execution" />

      {/* Notes from timer — pre-filled */}
      <div style={{ marginBottom: 24 }}>
        <div style={fieldLabel}>
          Block notes
          {timerNotes.length > 0 && (
            <span style={{ color: "var(--primary)", fontWeight: 400, marginLeft: 6, fontSize: 12 }}>
              ({timerNotes.length} note{timerNotes.length > 1 ? "s" : ""} from session)
            </span>
          )}
        </div>
        <textarea
          className="input" rows={3}
          placeholder="Notes from your session..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      {/* PDF usage */}
      <div style={{ marginBottom: 32 }}>
        <div style={fieldLabel}>Did you use any materials?</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {[{ val: true, label: "✓ Yes" }, { val: false, label: "✗ No" }].map(opt => (
            <button
              key={String(opt.val)}
              onClick={() => { setUsedPdf(opt.val); if (!opt.val) setSelectedPdfs([]); }}
              style={{
                flex: 1, padding: "12px", borderRadius: 12, cursor: "pointer",
                fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 500,
                transition: "all 0.15s",
                border:     usedPdf === opt.val ? "2px solid var(--primary)"  : "1.5px solid var(--border)",
                background: usedPdf === opt.val ? "var(--primary-bg)"         : "white",
                color:      usedPdf === opt.val ? "var(--primary)"             : "var(--muted)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {usedPdf === true && (
          <div className="fade-in" style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 7 }}>
            {PDF_LIST.map(p => {
              const on = selectedPdfs.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePdf(p.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                    textAlign: "left", fontFamily: "DM Sans, sans-serif",
                    transition: "all 0.15s",
                    border:     on ? "1.5px solid var(--primary)"  : "1.5px solid var(--border)",
                    background: on ? "var(--primary-bg)"           : "white",
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: on ? "none" : "1.5px solid var(--border)",
                    background: on ? "var(--primary)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {on && <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: on ? "var(--primary)" : "var(--text)" }}>{p.title}</div>
                    {p.author && <div style={{ fontSize: 11, color: "var(--faint)" }}>{p.author}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button className="btn-primary" onClick={handleConfirm} disabled={!categories.length}>
        Log &amp; Start Break
      </button>
      {!categories.length && (
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "var(--faint)" }}>
          Select at least one category to continue
        </div>
      )}
    </div>
  );
}

const eyebrow = {
  fontSize: 11, color: "var(--faint)", fontWeight: 600,
  letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6,
};
const fieldLabel = {
  fontSize: 13, color: "var(--muted)", fontWeight: 600, marginBottom: 10,
};