"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { EXERCISE_CATEGORIES } from "@/lib/constants";

export default function ExercisesPanel() {
  const { exercises, addExercise, deleteExercise } = useApp();
  const [open,    setOpen]    = useState(false);
  const [adding,  setAdding]  = useState(false);
  const [form,    setForm]    = useState({ name: "", category: "", description: "" });
  const [saving,  setSaving]  = useState(false);
  const [filter,  setFilter]  = useState("all");

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdd = async () => {
    if (!form.name || !form.category) return;
    setSaving(true);
    await addExercise(form);
    setForm({ name: "", category: "", description: "" });
    setAdding(false);
    setSaving(false);
  };

  const filtered = filter === "all"
    ? exercises
    : exercises.filter(e => e.category === filter);

  const cats = [...new Set(exercises.map(e => e.category))];

  return (
    <div className="card" style={{ marginBottom: 14 }}>
      {/* Header */}
      <button
        onClick={() => setOpen(x => !x)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>💪</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>My Exercises</span>
          {exercises.length > 0 && (
            <span style={{ fontSize: 12, color: "var(--faint)", background: "var(--primary-bg)", borderRadius: 100, padding: "2px 8px" }}>
              {exercises.length}
            </span>
          )}
        </div>
        <span style={{ color: "var(--faint)", fontSize: 18 }}>{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="fade-in" style={{ marginTop: 16 }}>

          {/* Category filter pills */}
          {cats.length > 1 && (
            <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12 }}>
              {["all", ...cats].map(c => {
                const cat = EXERCISE_CATEGORIES.find(x => x.id === c);
                return (
                  <button
                    key={c}
                    onClick={() => setFilter(c)}
                    style={{
                      padding: "5px 12px", borderRadius: 100, whiteSpace: "nowrap",
                      fontSize: 12, fontWeight: 500, cursor: "pointer",
                      fontFamily: "DM Sans, sans-serif",
                      border:     filter === c ? "1.5px solid var(--primary)"  : "1.5px solid var(--border)",
                      background: filter === c ? "var(--primary-bg)"           : "white",
                      color:      filter === c ? "var(--primary)"              : "var(--muted)",
                    }}
                  >
                    {c === "all" ? "All" : `${cat?.emoji} ${cat?.label}`}
                  </button>
                );
              })}
            </div>
          )}

          {/* Exercise list */}
          {filtered.length === 0 && !adding ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--faint)", fontSize: 14 }}>
              No exercises yet. Add your first one!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              {filtered.map(ex => (
                <ExerciseRow key={ex.id} exercise={ex} onDelete={() => deleteExercise(ex.id)} />
              ))}
            </div>
          )}

          {/* Add form */}
          {adding ? (
            <div className="fade-in" style={{ background: "var(--bg)", borderRadius: 12, padding: 14, marginBottom: 8 }}>
              <input
                className="input" placeholder="Exercise name *"
                value={form.name} onChange={set("name")}
                style={{ fontSize: 14, marginBottom: 10 }}
              />
              <select className="input" value={form.category} onChange={set("category")} style={{ fontSize: 14, marginBottom: 10 }}>
                <option value="">Select category *</option>
                {EXERCISE_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
              <textarea
                className="input" rows={2}
                placeholder="Description (optional) — e.g. All keys, 4 octaves"
                value={form.description} onChange={set("description")}
                style={{ fontSize: 14, marginBottom: 12 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, padding: "11px", fontSize: 14, opacity: saving ? 0.7 : 1 }}
                  onClick={handleAdd}
                  disabled={saving || !form.name || !form.category}
                >
                  {saving ? "Saving..." : "Add Exercise"}
                </button>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, padding: "11px", fontSize: 14 }}
                  onClick={() => { setAdding(false); setForm({ name: "", category: "", description: "" }); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              style={{
                width: "100%", padding: "11px", borderRadius: 12,
                border: "1.5px dashed var(--border)", background: "transparent",
                cursor: "pointer", fontSize: 13, color: "var(--muted)",
                fontFamily: "DM Sans, sans-serif", transition: "all 0.15s",
              }}
            >
              + Add exercise
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ExerciseRow({ exercise, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  const cat = EXERCISE_CATEGORIES.find(c => c.id === exercise.category);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 12px", borderRadius: 10,
      background: "white", border: "1px solid var(--border)",
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{cat?.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {exercise.name}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
          {exercise.lastBpm && (
            <span style={{ fontSize: 11, color: "var(--faint)" }}>Last: {exercise.lastBpm} BPM</span>
          )}
          {exercise.avgRating && (
            <span style={{ fontSize: 11, color: "var(--faint)" }}>★ {exercise.avgRating.toFixed(1)}</span>
          )}
          {exercise.timesPlayed > 0 && (
            <span style={{ fontSize: 11, color: "var(--faint)" }}>{exercise.timesPlayed}× played</span>
          )}
        </div>
      </div>
      {!confirm ? (
        <button onClick={() => setConfirm(true)} className="btn-ghost" style={{ fontSize: 16, padding: "2px 6px", flexShrink: 0 }}>🗑</button>
      ) : (
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={onDelete} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "#FEF0E6", border: "1px solid #FFCCCC", color: "#B03030", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Delete</button>
          <button onClick={() => setConfirm(false)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Cancel</button>
        </div>
      )}
    </div>
  );
}