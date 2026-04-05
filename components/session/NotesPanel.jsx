"use client";

import { useState, useRef, useEffect } from "react";
import { fmt } from "@/lib/helpers";

export default function NotesPanel({ elapsed, notes, onAddNote, isDesktop }) {
  const [open,  setOpen]  = useState(false);
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [notes]);

  const handleAdd = () => {
    if (!input.trim()) return;
    onAddNote({ text: input.trim(), time: elapsed });
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); }
  };

  // ── Desktop: inline panel (always visible) ─────────────────────────────
  if (isDesktop) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "20px 24px" }}>
      <div style={{ fontSize: 11, color: "var(--faint)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
        Block Notes
      </div>

      <div ref={listRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
        {notes.length === 0 ? (
          <div style={{ color: "var(--faint)", fontSize: 13, textAlign: "center", paddingTop: 20 }}>
            Notes appear here as you add them
          </div>
        ) : notes.map((n, i) => (
          <div key={i} style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 11, color: "var(--faint)", marginBottom: 3 }}>{fmt(n.time)}</div>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{n.text}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <textarea
          className="input"
          rows={2}
          placeholder="Add a note..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          style={{ fontSize: 13, flex: 1 }}
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          style={{
            padding: "0 14px", borderRadius: 10, border: "none",
            background: input.trim() ? "var(--primary)" : "var(--border)",
            color: "white", cursor: input.trim() ? "pointer" : "default",
            fontSize: 18, flexShrink: 0, transition: "all 0.15s",
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );

  // ── Mobile: bottom sheet ──────────────────────────────────────────────────
  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(x => !x)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "13px", borderRadius: 14,
          border: `1.5px solid ${notes.length > 0 ? "var(--primary)" : "var(--border)"}`,
          background: notes.length > 0 ? "var(--primary-bg)" : "white",
          cursor: "pointer", fontSize: 14, fontWeight: 500,
          color: notes.length > 0 ? "var(--primary)" : "var(--muted)",
          fontFamily: "DM Sans, sans-serif", transition: "all 0.15s",
          position: "relative",
        }}
      >
        📝 Notes
        {notes.length > 0 && (
          <span style={{
            position: "absolute", top: -6, right: -6,
            background: "var(--primary)", color: "white",
            borderRadius: "50%", width: 18, height: 18,
            fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {notes.length}
          </span>
        )}
      </button>

      {/* Bottom sheet */}
      {open && (
        <div
          className="fade-in"
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(43,58,78,0.3)", backdropFilter: "blur(2px)" }}
          />

          {/* Sheet */}
          <div style={{
            position: "relative", zIndex: 1,
            background: "white", borderRadius: "20px 20px 0 0",
            padding: "20px 20px max(24px, env(safe-area-inset-bottom))",
            maxHeight: "70dvh", display: "flex", flexDirection: "column",
            boxShadow: "0 -4px 24px rgba(43,58,78,0.12)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Block Notes</div>
              <button className="btn-ghost" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div ref={listRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 12, minHeight: 60 }}>
              {notes.length === 0 ? (
                <div style={{ color: "var(--faint)", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                  No notes yet — start typing!
                </div>
              ) : notes.map((n, i) => (
                <div key={i} style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 11, color: "var(--faint)", marginBottom: 3 }}>{fmt(n.time)}</div>
                  <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{n.text}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <textarea
                className="input" rows={2}
                placeholder="Add a note... (Enter to save)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                style={{ fontSize: 14, flex: 1 }}
                autoFocus
              />
              <button
                onClick={handleAdd}
                disabled={!input.trim()}
                style={{
                  padding: "0 16px", borderRadius: 10, border: "none",
                  background: input.trim() ? "var(--primary)" : "var(--border)",
                  color: "white", cursor: input.trim() ? "pointer" : "default",
                  fontSize: 20, flexShrink: 0,
                }}
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}