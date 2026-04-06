"use client";

import { useState, useEffect } from "react";
import { useBlockTimer }    from "@/hooks/useBlockTimer";
import { useMetronome }     from "@/hooks/useMetronome";
import MetronomePanel       from "@/components/ui/MetronomePanel";
import PDFViewer            from "@/components/ui/PDFViewer";
import ExerciseTracker      from "@/components/session/ExerciseTracker";
import { fmt }              from "@/lib/helpers";

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
  const timer          = useBlockTimer();
  const metro          = useMetronome();
  const isDesktop      = useIsDesktop();
  const [metroExpanded,  setMetroExpanded]  = useState(false);
  const [activePanel,    setActivePanel]    = useState(null); // null | "exercises" | "pdf"
  const [exerciseDone,   setExerciseDone]   = useState({});

  useEffect(() => {
    timer.setTarget(targetSec);
    timer.start();
  }, []);

  const handleEnd = () => {
    timer.pause();
    metro.stop();
    onEnd(timer.elapsed, exerciseDone);
  };

  const dash    = C2 * (1 - timer.progress);
  const doneCt  = Object.keys(exerciseDone).length;
  const panelOpen = activePanel !== null;

  // ── Desktop: 3 columns ────────────────────────────────────────────────────
  if (isDesktop) return (
    <div className="session-desktop fade-in">
      <div className="timer-panel">
        <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "36px 28px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Block {blockNum}</span>
            <span style={{ fontSize: 13, color: "var(--faint)" }}>Target {Math.floor(targetSec / 60)} min</span>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
            <TimerCircle timer={timer} dash={dash} handleEnd={handleEnd} size={240} fontSize={50} />
          </div>
          <MetronomePanel metro={metro} expanded={metroExpanded} onToggleExpand={() => setMetroExpanded(x => !x)} />
        </div>
      </div>
      <div style={{ width: 300, flexShrink: 0, borderRight: "1px solid var(--border)", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(10px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <ExerciseTracker elapsed={timer.elapsed} onUpdate={setExerciseDone} />
      </div>
      <div className="pdf-panel">
        <PDFViewer onClose={() => {}} embedded />
      </div>
    </div>
  );

  // ── Mobile panel open: mini header + panel ────────────────────────────────
  if (panelOpen) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }} className="fade-in">

      {/* Mini header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "max(14px, env(safe-area-inset-top)) 14px 12px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(14px)",
        flexShrink: 0,
      }}>
        {/* Mini timer badge */}
        <div className={`badge ${timer.overtime ? "badge-orange" : "badge-green"}`} style={{ flexShrink: 0 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: timer.running ? "var(--primary)" : "var(--faint)" }} />
          <span className="serif" style={{ fontSize: 16 }}>{fmt(timer.elapsed)}</span>
          {timer.overtime && <span style={{ fontSize: 11 }}>+{fmt(timer.elapsed - timer.target)}</span>}
        </div>

        {/* Mini metro */}
        <div style={{ flex: 1 }}>
          <MetronomePanel metro={metro} expanded={false} onToggleExpand={() => {}} />
        </div>

        {/* Back to timer */}
        <button
          onClick={() => setActivePanel(null)}
          className="btn-ghost"
          style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", flexShrink: 0 }}
        >
          ← Timer
        </button>
      </div>

      {/* Tab toggle */}
      <div style={{
        display: "flex", flexShrink: 0,
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border)",
      }}>
        {[
          { id: "exercises", label: "💪 Exercises", badge: doneCt > 0 ? doneCt : null },
          { id: "pdf",       label: "📄 Materials",  badge: null },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id)}
            style={{
              flex: 1, padding: "11px 8px", border: "none", cursor: "pointer",
              fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600,
              background: "transparent", position: "relative",
              color:        activePanel === tab.id ? "var(--primary)" : "var(--muted)",
              borderBottom: activePanel === tab.id ? "2.5px solid var(--primary)" : "2.5px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
            {tab.badge && (
              <span style={{
                position: "absolute", top: 5, right: 8,
                background: "var(--primary)", color: "white",
                borderRadius: "50%", width: 16, height: 16,
                fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div style={{ flex: 1, overflow: "hidden", background: "rgba(255,255,255,0.6)" }}>
        {activePanel === "exercises"
          ? <ExerciseTracker elapsed={timer.elapsed} onUpdate={setExerciseDone} />
          : <PDFViewer onClose={() => setActivePanel(null)} />
        }
      </div>
    </div>
  );

  // ── Mobile default: full timer ─────────────────────────────────────────────
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", padding: "max(40px, env(safe-area-inset-top)) 22px max(24px, env(safe-area-inset-bottom))" }} className="fade-in">

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexShrink: 0 }}>
        <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Block {blockNum}</span>
        <span style={{ fontSize: 13, color: "var(--faint)" }}>Target {Math.floor(targetSec / 60)} min</span>
      </div>

      {/* Full timer circle */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
        <TimerCircle timer={timer} dash={dash} handleEnd={handleEnd} size={260} fontSize={54} />
      </div>

      {/* Tools */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
        <MetronomePanel metro={metro} expanded={metroExpanded} onToggleExpand={() => setMetroExpanded(x => !x)} />

        {/* Panel button */}
        <button
          onClick={() => setActivePanel("exercises")}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "13px", borderRadius: 14,
            border: doneCt > 0 ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
            background: doneCt > 0 ? "var(--primary-bg)" : "white",
            cursor: "pointer", fontSize: 14, fontWeight: 600,
            color: doneCt > 0 ? "var(--primary)" : "var(--muted)",
            fontFamily: "DM Sans, sans-serif", transition: "all 0.15s",
          }}
        >
          {doneCt > 0 ? `💪 ${doneCt} done — Open Panel` : "💪 Exercises & Materials"}
        </button>
      </div>
    </div>
  );
}

// ── Shared timer circle ────────────────────────────────────────────────────
function TimerCircle({ timer, dash, handleEnd, size, fontSize }) {
  const R  = 110;
  const C2 = 2 * Math.PI * R;
  return (
    <div
      className={timer.overtime ? "timer-overtime" : ""}
      style={{ position: "relative", width: size, height: size, borderRadius: "50%", flexShrink: 0 }}
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
          style={{ fontSize, color: "var(--text)", letterSpacing: "-1.5px", lineHeight: 1 }}
        >
          {fmt(timer.elapsed)}
        </div>
        {timer.overtime ? (
          <div className="badge badge-orange">+{fmt(timer.elapsed - timer.target)}</div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--faint)" }}>{fmt(Math.max(0, timer.target - timer.elapsed))} left</div>
        )}
        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          <button onClick={timer.running ? timer.pause : timer.resume} style={ctrlBtnStyle}>
            {timer.running ? "⏸" : "▶"}
          </button>
          <button onClick={handleEnd} style={{ ...ctrlBtnStyle, background: "var(--primary)", border: "none", color: "white", fontWeight: 700, fontSize: 14 }}>
            End
          </button>
        </div>
      </div>
    </div>
  );
}

const ctrlBtnStyle = {
  width: 52, height: 52, borderRadius: "50%",
  border: "1.5px solid var(--primary-xl)", background: "var(--primary-bg)",
  cursor: "pointer", fontSize: 20,
  display: "flex", alignItems: "center", justifyContent: "center",
};