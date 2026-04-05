"use client";

import { useState, useEffect } from "react";
import { useBlockTimer }  from "@/hooks/useBlockTimer";
import { useMetronome }   from "@/hooks/useMetronome";
import MetronomePanel     from "@/components/ui/MetronomePanel";
import PDFViewer          from "@/components/ui/PDFViewer";
import NotesPanel         from "@/components/session/NotesPanel";
import { fmt }            from "@/lib/helpers";

const R  = 110;
const C2 = 2 * Math.PI * R;

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setDesktop(mq.matches);
    const h = e => setDesktop(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return desktop;
}

export default function SessionScreen({ blockNum, targetSec, onEnd }) {
  const timer     = useBlockTimer();
  const metro     = useMetronome();
  const isDesktop = useIsDesktop();
  const [metroExpanded, setMetroExpanded] = useState(false);
  const [pdfOpen,       setPdfOpen]       = useState(false);
  const [notes,         setNotes]         = useState([]);

  useEffect(() => {
    timer.setTarget(targetSec);
    timer.start();
  }, []);

  const handleEnd = () => {
    timer.pause();
    metro.stop();
    onEnd(timer.elapsed, notes);
  };

  const addNote = (note) => setNotes(prev => [...prev, note]);

  const dash = C2 * (1 - timer.progress);

  // ── Timer panel ────────────────────────────────────────────────────────────
  const TimerPanel = (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      padding: isDesktop
        ? "40px 32px 32px"
        : "max(40px, env(safe-area-inset-top)) 22px max(24px, env(safe-area-inset-bottom))",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexShrink: 0 }}>
        <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Block {blockNum}</div>
        <div style={{ fontSize: 13, color: "var(--faint)" }}>Target {Math.floor(targetSec / 60)} min</div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
        <div
          className={timer.overtime ? "timer-overtime" : ""}
          style={{ position: "relative", width: "min(260px, 72vw)", height: "min(260px, 72vw)", borderRadius: "50%", flexShrink: 0 }}
        >
          <svg viewBox="0 0 280 280" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
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
              style={{ fontSize: "clamp(36px, 12vw, 54px)", color: "var(--text)", letterSpacing: "-1.5px", lineHeight: 1 }}
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
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <button onClick={timer.running ? timer.pause : timer.resume} style={ctrlBtnStyle}>
                {timer.running ? "⏸" : "▶"}
              </button>
              <button onClick={handleEnd} style={{ ...ctrlBtnStyle, background: "var(--primary)", border: "none", color: "white", fontWeight: 700, fontSize: 14 }}>
                End
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
        <MetronomePanel metro={metro} expanded={metroExpanded} onToggleExpand={() => setMetroExpanded(x => !x)} />
        {!isDesktop && (
          <>
            <NotesPanel elapsed={timer.elapsed} notes={notes} onAddNote={addNote} isDesktop={false} />
            <button onClick={() => setPdfOpen(true)} style={toolBtnStyle}>📄 Open Materials</button>
          </>
        )}
      </div>
    </div>
  );

  // ── Desktop: 3 columns — timer | notes | PDF ───────────────────────────────
  if (isDesktop) return (
    <div className="session-desktop fade-in">
      <div className="timer-panel">{TimerPanel}</div>
      <div style={{
        width: 280, flexShrink: 0, borderRight: "1px solid var(--border)",
        background: "rgba(255,255,255,0.5)", backdropFilter: "blur(10px)",
        display: "flex", flexDirection: "column",
      }}>
        <NotesPanel elapsed={timer.elapsed} notes={notes} onAddNote={addNote} isDesktop={true} />
      </div>
      <div className="pdf-panel">
        <PDFViewer onClose={() => {}} embedded />
      </div>
    </div>
  );

  // ── Mobile PDF overlay ─────────────────────────────────────────────────────
  if (pdfOpen) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }} className="fade-in">
      <div style={topBarStyle}>
        <div className={`badge ${timer.overtime ? "badge-orange" : "badge-green"}`}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: timer.running ? "var(--primary)" : "var(--faint)" }} />
          <span className="serif" style={{ fontSize: 15 }}>{fmt(timer.elapsed)}</span>
          {timer.overtime && <span style={{ fontSize: 11 }}>+{fmt(timer.elapsed - timer.target)}</span>}
        </div>
        <div style={{ flex: 1, paddingLeft: 8 }}>
          <MetronomePanel metro={metro} expanded={false} onToggleExpand={() => {}} />
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <PDFViewer onClose={() => setPdfOpen(false)} />
      </div>
    </div>
  );

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }} className="fade-in">
      {TimerPanel}
    </div>
  );
}

const topBarStyle = {
  padding: "max(12px, env(safe-area-inset-top)) 14px 12px",
  display: "flex", alignItems: "center", gap: 8,
  borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0,
};
const ctrlBtnStyle = {
  width: 52, height: 52, borderRadius: "50%",
  border: "1.5px solid var(--primary-xl)", background: "var(--primary-bg)",
  cursor: "pointer", fontSize: 20,
  display: "flex", alignItems: "center", justifyContent: "center",
};
const toolBtnStyle = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "13px", borderRadius: 14,
  border: "1.5px solid var(--border)", background: "white",
  cursor: "pointer", fontSize: 14, fontWeight: 500, color: "var(--muted)",
  fontFamily: "DM Sans, sans-serif", transition: "all 0.15s",
};