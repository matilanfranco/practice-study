"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import { fmt } from "@/lib/helpers";
import StarRating from "@/components/ui/StarRating";

export default function BlockLog({ elapsed, blockNum, onConfirm }) {
  const [categories,  setCategories]  = useState([]);
  const [description, setDescription] = useState("");
  const [focus,       setFocus]       = useState(0);
  const [dexterity,   setDexterity]   = useState(0);
  const [notes,       setNotes]       = useState("");

  const toggleCategory = (id) => {
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    if (categories.length === 0) return;
    onConfirm({ categories, description, focus, dexterity, notes, duration: elapsed });
  };

  return (
    <div style={{ padding: "44px 22px 40px", overflowY: "auto" }} className="slide-up">
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

      {/* Category — multi select */}
      <div style={{ marginBottom: 22 }}>
        <div style={fieldLabel}>
          What did you work on?{" "}
          <span style={{ color: "var(--faint)", fontWeight: 400 }}>
            (select all that apply)
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`chip ${categories.includes(c.id) ? "active" : ""}`}
              onClick={() => toggleCategory(c.id)}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
        {categories.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--primary)", fontWeight: 500 }}>
            {categories
              .map((id) => CATEGORIES.find((c) => c.id === id)?.label)
              .join(" · ")}
          </div>
        )}
      </div>

      {/* Description */}
      <div style={{ marginBottom: 22 }}>
        <div style={fieldLabel}>What specifically?</div>
        <textarea
          className="input"
          rows={3}
          placeholder="e.g. C major scale in thirds, chromatic at 80 BPM..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <StarRating value={focus}     onChange={setFocus}     label="Focus level" />
      <StarRating value={dexterity} onChange={setDexterity} label="Dexterity / execution" />

      <div style={{ marginBottom: 32 }}>
        <div style={fieldLabel}>Notes (optional)</div>
        <textarea
          className="input"
          rows={2}
          placeholder="Something to remember for next time..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button className="btn-primary" onClick={handleConfirm} disabled={categories.length === 0}>
        Log &amp; Start Break
      </button>

      {categories.length === 0 && (
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