"use client";

import { useState } from "react";
import { PDF_LIST } from "@/lib/constants";

export default function PDFViewer({ onClose }) {
  const [selected, setSelected] = useState(null);
  const [page,     setPage]     = useState(1);

  if (selected) return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={headerStyle}>
        <button className="btn-ghost" onClick={() => { setSelected(null); setPage(1); }}>← Back</button>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--text)", textAlign: "center" }}>
          {selected.title}
        </span>
        <button className="btn-ghost" onClick={onClose}>✕</button>
      </div>

      {/* Page mock */}
      <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
        <div style={pageMockStyle}>
          <div style={{ fontSize: 38, marginBottom: 12 }}>📄</div>
          <div style={{ fontWeight: 600, color: "var(--primary)", fontSize: 15 }}>{selected.title}</div>
          <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 4 }}>
            Page {page} of {selected.pages}
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: "var(--primary-xl)", textAlign: "center", fontStyle: "italic", lineHeight: 1.6 }}>
            PDF renders here.<br />
            Place your files in <code style={{ fontSize: 11 }}>/public/pdfs/</code>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
        <button className="btn-secondary" style={{ padding: "10px 24px" }} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>←</button>
        <span style={{ fontSize: 14, color: "var(--muted)" }}>{page} / {selected.pages}</span>
        <button className="btn-secondary" style={{ padding: "10px 24px" }} onClick={() => setPage((p) => Math.min(selected.pages, p + 1))} disabled={page === selected.pages}>→</button>
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <div style={headerStyle}>
        <span className="serif" style={{ fontSize: 22 }}>Materials</span>
        <button className="btn-ghost" onClick={onClose}>✕</button>
      </div>
      <div style={{ padding: 16 }}>
        {PDF_LIST.map((p) => (
          <div
            key={p.id}
            onClick={() => { setSelected(p); setPage(1); }}
            style={listItemStyle}
          >
            <div>
              <div style={{ fontWeight: 500, color: "var(--text)", fontSize: 14 }}>{p.title}</div>
              <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 2 }}>{p.category} · {p.pages} pages</div>
            </div>
            <span style={{ color: "var(--primary)", fontSize: 18 }}>→</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const headerStyle = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "12px 18px 16px", borderBottom: "1px solid var(--border)", gap: 8,
};

const pageMockStyle = {
  background: "white", border: "1px solid #e5e5e5", borderRadius: 6,
  minHeight: 380, display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center", gap: 0, padding: 30,
};

const listItemStyle = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "14px 16px", background: "white", borderRadius: 12,
  marginBottom: 8, border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.15s",
};
