"use client";

import { useState, useEffect, useRef } from "react";
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
  const [metroExpanded, setMetroExpanded] = useState(false);
  const [activePanel,   setActivePanel]   = useState("exercises"); // "exercises" | "pdf"
  const [exerciseDone,  setExerciseDone]  = useState({});

  useEffect(() => {
    timer.setTarget(targetSec);
    timer.start();
  }, []);

  const handleEnd = () => {
    timer.pause();
    metro.stop();
    onEnd(timer.elapsed, exerciseDone);
  };

  const dash = C2 * (1 - timer.progress);
  const doneCt = Object.keys(exerciseDone).length;

  // ── Desktop: 3 columns ────────────────────────────────────────────────────
  if (isDesktop) return (
    <div className="session-desktop fade-in">
      {/* Left: timer */}
      <div className="timer-panel">
        <TimerContent
          timer={timer} metro={metro} blockNum={blockNum} targetSec={targetSec}
          metroExpanded={metroExpanded} setMetroExpanded={setMetroExpanded}
          handleEnd={handleEnd} dash={dash} isDesktop={true}
        />
      </div>

      {/* Centre: exercises */}
      <div style={{
        width: 300, flexShrink: 0, borderRight: "1px solid var(--border)",
        background: "rgba(255,255,255,0.55)", backdropFilter: "blur(10px)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <ExerciseTracker elapsed={timer.elapsed} onUpdate={setExerciseDone} />
      </div>

      {/* Right: PDF */}
      <div className="pdf-panel">
        <PDFViewer onClose={() => {}} embedded />
      </div>
    </div>
  );

  // ── Mobile ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }} className="fade-in">
      {/* Timer */}
      <TimerContent
        timer={timer} metro={metro} blockNum={blockNum} targetSec={targetSec}
        metroExpanded={metroExpanded} setMetroExpanded={setMetroExpanded}
        handleEnd={handleEnd} dash={dash} isDesktop={false}
      />

      {/* Toggle tabs */}
      <div style={{
        display: "flex", borderTop: "1px solid var(--border)",
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)",
        flexShrink: 0,
      }}>
        {[
          { id: "exercises", label: "💪 Exercises", badge: doneCt > 0 ? doneCt : null },
          { id: "pdf",       label: "📄 Materials",  badge: null },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id)}
            style={{
              flex: 1, padding: "12px 8px", border: "none", cursor: "pointer",
              fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600,
              transition: "all 0.15s", position: "relative",
              background: activePanel === tab.id ? "var(--primary-bg)" : "transparent",
              color:      activePanel === tab.id ? "var(--primary)"    : "var(--muted)",
              borderBottom: activePanel === tab.id ? "2px solid var(--primary)" : "2px solid transparent",
            }}
          >
            {tab.label}
            {tab.badge && (
              <span style={{
                position: "absolute", top: 6, right: 8,
                background: "var(--primary)", color: "white",
                borderRadius: "50%", width: 16, height: 16, fontSize: 10, fontWeight: 700,
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
        {activePanel === "exercises" ? (
          <ExerciseTracker elapsed={timer.elapsed} onUpdate={setExerciseDone} />
        ) : (
          <PDFViewer onClose={() => setActivePanel("exercises")} />
        )}
      </div>
    </div>
  );
}

// ── Timer content (shared) ─────────────────────────────────────────────────
function TimerContent({ timer, metro, blockNum, targetSec, metroExpanded, setMetroExpanded, handleEnd, dash, isDesktop }) {
  const R  = 110;
  const C2 = 2 * Math.PI * R;

  return (
    <div style={{
      display: "flex", flexDirection: "column", flexShrink: 0,
      padding: isDesktop
        ? "32px 28px 24px"
        : "max(36px, env(safe-area-inset-top)) 20px 16px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Block {blockNum}</div>
        <div style={{ fontSize: 13, color: "var(--faint)" }}>Target {Math.floor(targetSec / 60)} min</div>
      </div>

      {/* Circle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: isDesktop ? "8px 0" : "4px 0" }}>
        <div
          className={timer.overtime ? "timer-overtime" : ""}
          style={{
            position: "relative",
            width:  isDesktop ? 220 : "min(200px, 55vw)",
            height: isDesktop ? 220 : "min(200px, 55vw)",
            borderRadius: "50%", flexShrink: 0,
          }}
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
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <div
              className={`timer-num ${!timer.running ? "timer-paused" : ""}`}
              style={{ fontSize: isDesktop ? 48 : "clamp(32px, 11vw, 46px)", color: "var(--text)", letterSpacing: "-1.5px", lineHeight: 1 }}
            >
              {fmt(timer.elapsed)}
            </div>
            {timer.overtime ? (
              <div className="badge badge-orange" style={{ fontSize: 11 }}>+{fmt(timer.elapsed - timer.target)}</div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--faint)" }}>{fmt(Math.max(0, timer.target - timer.elapsed))} left</div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={timer.running ? timer.pause : timer.resume} style={ctrlBtnStyle}>
                {timer.running ? "⏸" : "▶"}
              </button>
              <button onClick={handleEnd} style={{ ...ctrlBtnStyle, background: "var(--primary)", border: "none", color: "white", fontWeight: 700, fontSize: 13 }}>
                End
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metro */}
      <div style={{ marginTop: 10 }}>
        <MetronomePanel metro={metro} expanded={metroExpanded} onToggleExpand={() => setMetroExpanded(x => !x)} />
      </div>
    </div>
  );
}

const ctrlBtnStyle = {
  width: 48, height: 48, borderRadius: "50%",
  border: "1.5px solid var(--primary-xl)", background: "var(--primary-bg)",
  cursor: "pointer", fontSize: 18,
  display: "flex", alignItems: "center", justifyContent: "center",
};