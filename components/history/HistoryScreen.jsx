"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { CATEGORIES, PDF_LIST } from "@/lib/constants";
import { fmt } from "@/lib/helpers";
import StarRating from "@/components/ui/StarRating";

export default function HistoryScreen() {
  const { blocks } = useApp();

  const grouped = blocks.reduce((acc, b) => {
    const day = new Date(b.date).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(b);
    return acc;
  }, {});

  return (
    <div className="screen fade-in">
      <h2 className="serif" style={{ fontSize: 36, marginBottom: 6 }}>Journal</h2>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 28 }}>
        Your practice history
      </p>

      {blocks.length === 0 ? (
        <EmptyState />
      ) : (
        Object.entries(grouped).map(([date, dayBlocks]) => (
          <DayGroup key={date} date={date} blocks={dayBlocks} />
        ))
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📒</div>
      <div className="serif" style={{ fontSize: 24, color: "var(--text)", marginBottom: 8 }}>
        Nothing here yet
      </div>
      <div style={{ color: "var(--faint)", fontSize: 14 }}>
        Complete your first block to see your history
      </div>
    </div>
  );
}

function DayGroup({ date, blocks }) {
  const total = blocks.reduce((s, b) => s + (b.duration || 0), 0);
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
          {new Date(date).toLocaleDateString("en-US", {
            weekday: "long", month: "short", day: "numeric",
          })}
        </div>
        <div style={{ fontSize: 12, color: "var(--faint)" }}>{fmt(total)} total</div>
      </div>
      {blocks.map((b, i) => <BlockCard key={b.id || i} block={b} />)}
    </div>
  );
}

function BlockCard({ block }) {
  const { deleteBlock, updateBlock } = useApp();
  const [showActions, setShowActions] = useState(false);
  const [editing,     setEditing]     = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(false);
  const [saving,      setSaving]      = useState(false);

  // Edit form state
  const [categories,   setCategories]   = useState(block.categories || (block.category ? [block.category] : []));
  const [description,  setDescription]  = useState(block.description || "");
  const [focus,        setFocus]        = useState(block.focus || 0);
  const [dexterity,    setDexterity]    = useState(block.dexterity || 0);
  const [notes,        setNotes]        = useState(block.notes || "");
  const [usedPdf,      setUsedPdf]      = useState(block.usedPdf || false);
  const [selectedPdfs, setSelectedPdfs] = useState(block.pdfsUsed || []);

  const categoryIds = block.categories || (block.category ? [block.category] : []);
  const cats        = categoryIds.map(id => CATEGORIES.find(c => c.id === id)).filter(Boolean);
  const ratings     = [block.focus, block.dexterity].filter(Boolean);
  const avgRating   = ratings.length
    ? (ratings.reduce((s, v) => s + v, 0) / ratings.length).toFixed(1)
    : null;

  const toggleCategory = (id) =>
    setCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const togglePdf = (id) =>
    setSelectedPdfs(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const handleDelete = async () => {
    await deleteBlock(block.id);
    setConfirmDel(false);
  };

  const handleSave = async () => {
    if (!categories.length) return;
    setSaving(true);
    await updateBlock(block.id, {
      categories, description, focus, dexterity, notes,
      usedPdf, pdfsUsed: usedPdf ? selectedPdfs : [],
    });
    setSaving(false);
    setEditing(false);
    setShowActions(false);
  };

  const handleCancelEdit = () => {
    setCategories(block.categories || (block.category ? [block.category] : []));
    setDescription(block.description || "");
    setFocus(block.focus || 0);
    setDexterity(block.dexterity || 0);
    setNotes(block.notes || "");
    setUsedPdf(block.usedPdf || false);
    setSelectedPdfs(block.pdfsUsed || []);
    setEditing(false);
  };

  // ── Edit form ──────────────────────────────────────────────────────────────
  if (editing) return (
    <div className="card slide-up" style={{ marginBottom: 10, padding: "18px" }}>
      <div style={eyebrow}>Editing block</div>

      {/* Categories */}
      <div style={{ marginBottom: 18 }}>
        <div style={fieldLabel}>Category</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              className={`chip ${categories.includes(c.id) ? "active" : ""}`}
              onClick={() => toggleCategory(c.id)}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 18 }}>
        <div style={fieldLabel}>What specifically?</div>
        <textarea
          className="input" rows={2}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. C major scale in thirds..."
        />
      </div>

      <StarRating value={focus}     onChange={setFocus}     label="Focus level" />
      <StarRating value={dexterity} onChange={setDexterity} label="Dexterity / execution" />

      {/* Notes */}
      <div style={{ marginBottom: 18 }}>
        <div style={fieldLabel}>Notes</div>
        <textarea
          className="input" rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Something to remember..."
        />
      </div>

      {/* Materials */}
      <div style={{ marginBottom: 22 }}>
        <div style={fieldLabel}>Did you use any materials?</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          {[{ val: true, label: "✓ Yes" }, { val: false, label: "✗ No" }].map(opt => (
            <button
              key={String(opt.val)}
              onClick={() => { setUsedPdf(opt.val); if (!opt.val) setSelectedPdfs([]); }}
              style={{
                flex: 1, padding: "10px", borderRadius: 12, cursor: "pointer",
                fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 500,
                border:     usedPdf === opt.val ? "2px solid var(--primary)"  : "1.5px solid var(--border)",
                background: usedPdf === opt.val ? "var(--primary-bg)"         : "white",
                color:      usedPdf === opt.val ? "var(--primary)"             : "var(--muted)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {usedPdf && (
          <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
            {PDF_LIST.map(p => {
              const on = selectedPdfs.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePdf(p.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 12px", borderRadius: 9, cursor: "pointer",
                    textAlign: "left", fontFamily: "DM Sans, sans-serif",
                    transition: "all 0.15s",
                    border:     on ? "1.5px solid var(--primary)"  : "1.5px solid var(--border)",
                    background: on ? "var(--primary-bg)"           : "white",
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: on ? "none" : "1.5px solid var(--border)",
                    background: on ? "var(--primary)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {on && <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: on ? "var(--primary)" : "var(--text)" }}>
                      {p.title}
                    </div>
                    {p.author && (
                      <div style={{ fontSize: 11, color: "var(--faint)" }}>{p.author}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Save / Cancel */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="btn-primary"
          style={{ flex: 1, opacity: saving ? 0.7 : 1 }}
          onClick={handleSave}
          disabled={saving || !categories.length}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={handleCancelEdit}>
          Cancel
        </button>
      </div>
    </div>
  );

  // ── Normal card view ───────────────────────────────────────────────────────
  return (
    <div className="card" style={{ marginBottom: 8, padding: "15px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>

          {/* Categories */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            {cats.map(cat => (
              <span key={cat.id} style={catBadgeStyle}>
                {cat.emoji} {cat.label}
              </span>
            ))}
          </div>

          {block.description && (
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6, lineHeight: 1.4 }}>
              {block.description}
            </div>
          )}

          {/* Ratings */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {block.focus > 0 && (
              <span style={{ fontSize: 12, color: "var(--faint)" }}>
                Focus {"★".repeat(block.focus)}{"☆".repeat(5 - block.focus)}
              </span>
            )}
            {block.dexterity > 0 && (
              <span style={{ fontSize: 12, color: "var(--faint)" }}>
                Dex {"★".repeat(block.dexterity)}{"☆".repeat(5 - block.dexterity)}
              </span>
            )}
          </div>

          {/* Materials used */}
          {block.usedPdf && block.pdfsUsed?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: "var(--faint)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>
                Materials used
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {block.pdfsUsed.map(id => {
                  const pdf = PDF_LIST.find(p => p.id === id);
                  return pdf ? (
                    <span key={id} style={pdfBadgeStyle}>📄 {pdf.title}</span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Time + avg + menu */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, marginLeft: 12, flexShrink: 0 }}>
          <div className="serif" style={{ fontSize: 20, color: "var(--primary)" }}>
            {fmt(block.duration || 0)}
          </div>
          {avgRating && (
            <div style={{ fontSize: 11, color: "var(--faint)" }}>★ {avgRating}</div>
          )}
          <button
            onClick={() => setShowActions(x => !x)}
            className="btn-ghost"
            style={{ fontSize: 20, lineHeight: 1, padding: "2px 6px", color: showActions ? "var(--primary)" : "var(--faint)" }}
          >
            ···
          </button>
        </div>
      </div>

      {/* Notes */}
      {block.notes && !showActions && (
        <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--bg)", borderRadius: 8, fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
          {block.notes}
        </div>
      )}

      {/* Action buttons */}
      {showActions && (
        <div className="fade-in" style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          {!confirmDel ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { setEditing(true); setShowActions(false); }}
                style={actionBtn("var(--primary)", "var(--primary-bg)", "var(--primary-xl)")}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => setConfirmDel(true)}
                style={actionBtn("#B03030", "#FEF0E6", "#FFCCCC")}
              >
                🗑 Delete
              </button>
              <button
                onClick={() => setShowActions(false)}
                style={actionBtn("var(--muted)", "var(--bg)", "var(--border)")}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 13, color: "var(--danger)", fontWeight: 500, flex: 1 }}>
                Delete this block?
              </div>
              <button onClick={handleDelete} style={actionBtn("#B03030", "#FEF0E6", "#FFCCCC")}>
                Yes, delete
              </button>
              <button onClick={() => setConfirmDel(false)} style={actionBtn("var(--muted)", "var(--bg)", "var(--border)")}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const eyebrow = {
  fontSize: 11, color: "var(--faint)", fontWeight: 600,
  letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14,
};

const fieldLabel = {
  fontSize: 13, color: "var(--muted)", fontWeight: 600, marginBottom: 8,
};

const catBadgeStyle = {
  display: "inline-flex", alignItems: "center", gap: 4,
  fontSize: 13, fontWeight: 600, color: "var(--text)",
  background: "var(--primary-bg)", borderRadius: 100,
  padding: "3px 10px", border: "1px solid var(--primary-xl)",
};

const pdfBadgeStyle = {
  fontSize: 11, color: "var(--muted)",
  background: "var(--bg)", borderRadius: 6,
  padding: "3px 8px", border: "1px solid var(--border)",
};

const actionBtn = (color, bg, border) => ({
  padding: "8px 14px", borderRadius: 10, cursor: "pointer",
  fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 500,
  border: `1.5px solid ${border}`, background: bg, color,
  transition: "all 0.15s",
});