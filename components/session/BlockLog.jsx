"use client";

import { useState } from "react";
import { CATEGORIES, PDF_LIST } from "@/lib/constants";
import { fmt } from "@/lib/helpers";
import StarRating from "@/components/ui/StarRating";

export default function BlockLog({ elapsed, blockNum, onConfirm }) {
  const [categories,   setCategories]   = useState([]);
  const [description,  setDescription]  = useState("");
  const [focus,        setFocus]        = useState(0);
  const [dexterity,    setDexterity]    = useState(0);
  const [notes,        setNotes]        = useState("");
  const [usedPdf,      setUsedPdf]      = useState(null); // null | true | false
  const [selectedPdfs, setSelectedPdfs] = useState([]);

  const toggleCategory = (id) =>
    setCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const togglePdf = (id) =>
    setSelectedPdfs(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const handleConfirm = () => {
    if (!categories.length) return;
    onConfirm({
      categories, description, focus, dexterity, notes, duration: elapsed,
      usedPdf: usedPdf === true,
      pdfsUsed: usedPdf === true ? selectedPdfs : [],
    });
  };

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

      {/* Description */}
      <div style={{ marginBottom: 22 }}>
        <div style={fieldLabel}>What specifically?</div>
        <textarea className="input" rows={3} placeholder="e.g. C major scale in thirds, chromatic at 80 BPM..."
          value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      <StarRating value={focus}     onChange={setFocus}     label="Focus level" />
      <StarRating value={dexterity} onChange={setDexterity} label="Dexterity / execution" />

      {/* Notes */}
      <div style={{ marginBottom: 24 }}>
        <div style={fieldLabel}>Notes (optional)</div>
        <textarea className="input" rows={2} placeholder="Something to remember for next time..."
          value={notes} onChange={e => setNotes(e.target.value)} />
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

        {/* PDF multi-select — solo aparece si usedPdf === true */}
        {usedPdf === true && (
          <div className="fade-in">
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Select which ones:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 220, overflowY: "auto", paddingRight: 4 }}>
              {PDF_LIST.map(p => {
                const on = selectedPdfs.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePdf(p.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                      fontFamily: "DM Sans, sans-serif", textAlign: "left",
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
            {selectedPdfs.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--primary)", fontWeight: 500 }}>
                {selectedPdfs.length} material{selectedPdfs.length > 1 ? "s" : ""} selected
              </div>
            )}
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