"use client";

import { useState, useEffect } from "react";
import { useBlockTimer } from "@/hooks/useBlockTimer";
import { useMetronome }  from "@/hooks/useMetronome";
import MetronomePanel    from "@/components/ui/MetronomePanel";
import PDFViewer         from "@/components/ui/PDFViewer";
import { fmt }           from "@/lib/helpers";

const R   = 110;
const C2  = 2 * Math.PI * R;

export default function SessionScreen({ blockNum, targetSec, onEnd }) {
  const timer  = useBlockTimer();
  const metro  = useMetronome();
  const [metroExpanded, setMetroExpanded] = useState(false);
  const [pdfOpen,       setPdfOpen]       = useState(false);

  useEffect(() => {
    timer.setTarget(targetSec);
    timer.start();
  }, []);

  const handleEnd = () => {
    timer.pause();
    metro.stop();
    onEnd(timer.elapsed);
  };

  const dash = C2 * (1 - timer.progress);

  // ── PDF mode: timer shrinks to top badge ──────────────────────────────────
  if (pdfOpen) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }} className="fade-in">
      <div style={topBarStyle}>
        {/* Mini timer badge */}
        <div className={`badge ${timer.overtime ? "badge-orange" : "badge-green"}`}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: timer.running ? "var(--primary)" : "var(--faint)" }} />
          <span className="serif" style={{ fontSize: 15 }}>{fmt(timer.elapsed)}</span>
          {timer.overtime && (
            <span style={{ fontSize: 11 }}>+{fmt(timer.elapsed - timer.target)}</span>
          )}
        </div>

        {/* Compact metro — not expandable in PDF mode */}
        <div style={{ flex: 1, paddingLeft: 8 }}>
          <MetronomePanel metro={metro} expanded={false} onToggleExpand={() => {}} />
        </div>

        <button className="btn-ghost" onClick={() => setPdfOpen(false)} style={{ fontSize: 13, flexShrink: 0 }}>
          Hide PDF
        </button>
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <PDFViewer onClose={() => setPdfOpen(false)} />
      </div>
    </div>
  );

  // ── Normal timer mode ─────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "40px 22px 28px" }} className="fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Block {blockNum}</div>
        <div style={{ fontSize: 13, color: "var(--faint)" }}>Target {Math.floor(targetSec / 60)} min</div>
      </div>

      {/* Timer circle */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          className={timer.overtime ? "timer-overtime" : ""}
          style={{ position: "relative", width: "min(280px, 78vw)", height: "min(280px, 78vw)", borderRadius: "50%" }}
        >
          <svg
            viewBox="0 0 280 280"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            <circle cx="140" cy="140" r={R} fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle
              cx="140" cy="140" r={R} fill="none"
              stroke={timer.overtime ? "var(--warning)" : "var(--primary)"}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={C2} strokeDashoffset={dash}
              className="timer-ring"
            />
          </svg>

          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <div
              className={`timer-num ${!timer.running ? "timer-paused" : ""}`}
              style={{ fontSize: 54, color: "var(--text)", letterSpacing: "-1.5px", lineHeight: 1 }}
            >
              {fmt(timer.elapsed)}
            </div>

            {timer.overtime ? (
              <div className="badge badge-orange">+{fmt(timer.elapsed - timer.target)} extra</div>
            ) : (
              <div style={{ fontSize: 13, color: "var(--faint)" }}>
                {fmt(Math.max(0, timer.target - timer.elapsed))} left
              </div>
            )}

            {/* Controls */}
            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              <button onClick={timer.running ? timer.pause : timer.resume} style={ctrlBtnStyle}>
                {timer.running ? "⏸" : "▶"}
              </button>
              <button
                onClick={handleEnd}
                style={{ ...ctrlBtnStyle, background: "var(--primary)", border: "none", color: "white", fontWeight: 700, fontSize: 14 }}
              >
                End
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tools */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <MetronomePanel
          metro={metro}
          expanded={metroExpanded}
          onToggleExpand={() => { setMetroExpanded((x) => !x); }}
        />
        <button
          onClick={() => { setPdfOpen(true); setMetroExpanded(false); }}
          style={pdfBtnStyle}
        >
          📄 Open Materials
        </button>
      </div>
    </div>
  );
}

const topBarStyle = {
  padding: "10px 14px",
  display: "flex", alignItems: "center", gap: 8,
  borderBottom: "1px solid var(--border)", background: "var(--surface)",
};

const ctrlBtnStyle = {
  width: 52, height: 52, borderRadius: "50%",
  border: "1.5px solid var(--primary-xl)", background: "var(--primary-bg)",
  cursor: "pointer", fontSize: 20,
  display: "flex", alignItems: "center", justifyContent: "center",
};

const pdfBtnStyle = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "13px", borderRadius: 14,
  border: "1.5px solid var(--border)", background: "white",
  cursor: "pointer", fontSize: 14, fontWeight: 500, color: "var(--muted)",
  fontFamily: "DM Sans, sans-serif", transition: "all 0.15s",
};
