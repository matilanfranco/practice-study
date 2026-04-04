"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PDF_LIST } from "@/lib/constants";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const CATEGORIES = [...new Set(PDF_LIST.map(p => p.category))].sort();

export default function PDFViewer({ onClose, embedded = false }) {
  const [selected,  setSelected]  = useState(null);
  const [page,      setPage]      = useState(1);
  const [numPages,  setNumPages]  = useState(null);
  const [search,    setSearch]    = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [width,     setWidth]     = useState(600);
  const containerRef = useRef(null);

  // Touch swipe
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 50 && Math.abs(dx) > dy) {
      if (dx > 0 && page < numPages) setPage(p => p + 1);
      if (dx < 0 && page > 1)        setPage(p => p - 1);
    }
    touchStartX.current = null;
  };

  // Fit PDF to container width
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width - 32));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [selected]);

  const filtered = PDF_LIST.filter(p => {
    const matchCat    = activeCat === "All" || p.category === activeCat;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                        p.author.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── PDF open view ──────────────────────────────────────────────────────────
  if (selected) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={headerStyle}>
        <button className="btn-ghost" onClick={() => { setSelected(null); setPage(1); setNumPages(null); }}>← Back</button>
        <div style={{ flex: 1, textAlign: "center", padding: "0 8px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>{selected.title}</div>
          {selected.author && <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2 }}>{selected.author}</div>}
        </div>
        <button className="btn-ghost" onClick={onClose}>✕</button>
      </div>

      {/* PDF page */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ flex: 1, overflowY: "auto", overflowX: "hidden", background: "#e8e8e8", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "16px" }}
      >
        <Document
          file={`/pdfs/${encodeURIComponent(selected.filename)}`}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div style={loadingStyle}>Loading...</div>}
          error={<div style={loadingStyle}>Error loading PDF</div>}
        >
          <Page
            pageNumber={page}
            width={width || 600}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>

      {/* Pagination */}
      {numPages && (
        <div style={paginationStyle}>
          <button
            className="btn-ghost"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ fontSize: 22, padding: "8px 16px", opacity: page === 1 ? 0.3 : 1 }}
          >
            ←
          </button>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{page} / {numPages}</span>
          <button
            className="btn-ghost"
            onClick={() => setPage(p => Math.min(numPages, p + 1))}
            disabled={page === numPages}
            style={{ fontSize: 22, padding: "8px 16px", opacity: page === numPages ? 0.3 : 1 }}
          >
            →
          </button>
        </div>
      )}
    </div>
  );

  // ── Library view ──────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={headerStyle}>
        <span className="serif" style={{ fontSize: 22 }}>Materials</span>
        <button className="btn-ghost" onClick={onClose}>✕</button>
      </div>

      {/* Search */}
      <div style={{ padding: "12px 16px 8px" }}>
        <input
          className="input"
          placeholder="Search title or author..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ fontSize: 14 }}
        />
      </div>

      {/* Category pills */}
      <div style={{ display: "flex", gap: 8, padding: "4px 16px 10px", overflowX: "auto", flexShrink: 0 }}>
        {["All", ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            style={{
              padding: "6px 14px", borderRadius: 100, whiteSpace: "nowrap",
              border: activeCat === cat ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
              background: activeCat === cat ? "var(--primary-bg)" : "white",
              color: activeCat === cat ? "var(--primary)" : "var(--muted)",
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--faint)", fontSize: 14 }}>
            No results
          </div>
        ) : filtered.map(p => (
          <div
            key={p.id}
            onClick={() => { setSelected(p); setPage(1); }}
            style={listItemStyle}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, color: "var(--text)", fontSize: 14 }}>{p.title}</div>
              <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 2 }}>
                {p.author && <span>{p.author} · </span>}
                <span style={{ background: "var(--primary-bg)", color: "var(--primary)", borderRadius: 100, padding: "1px 8px", fontSize: 11 }}>{p.category}</span>
              </div>
            </div>
            <span style={{ color: "var(--primary)", fontSize: 18, flexShrink: 0 }}>→</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const headerStyle = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "12px 18px", borderBottom: "1px solid var(--border)", gap: 8, flexShrink: 0,
};
const paginationStyle = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "10px 20px", borderTop: "1px solid var(--border)", flexShrink: 0,
  background: "var(--surface)",
};
const loadingStyle = {
  padding: "40px", textAlign: "center", color: "var(--faint)", fontSize: 14,
};
const listItemStyle = {
  display: "flex", alignItems: "center", gap: 12,
  padding: "13px 14px", background: "white", borderRadius: 12,
  marginBottom: 8, border: "1px solid var(--border)",
  cursor: "pointer", transition: "all 0.15s",
};