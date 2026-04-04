"use client";

import { useState, useEffect, useRef } from "react";
import { BREAK_PRESETS } from "@/lib/constants";
import { fmt } from "@/lib/helpers";
import { playBreakAlarm } from "@/lib/sounds";

const R  = 90;
const C2 = 2 * Math.PI * R;

export default function BreakScreen({ blockNum, onNext, onEnd }) {
  const [phase,   setPhase]   = useState("setup"); // "setup" | "running"
  const [durMin,  setDurMin]  = useState(10);
  const [remain,  setRemain]  = useState(600);
  const [running, setRunning] = useState(false);
  const [over,    setOver]    = useState(false);
  const [extra,   setExtra]   = useState(0);

  const int$  = useRef(null);
  const over$ = useRef(false);

  const startBreak = () => {
    const secs = durMin * 60;
    setRemain(secs);
    setOver(false);
    setExtra(0);
    over$.current = false;
    setRunning(true);
    setPhase("running");
  };

  useEffect(() => {
    if (!running) return;

    int$.current = setInterval(() => {
      setRemain((r) => {
        if (r <= 1) {
          if (!over$.current) {
            over$.current = true;
            setOver(true);
            playBreakAlarm();
          }
          return 0;
        }
        return r - 1;
      });

      setExtra((e) => {
        if (!over$.current) return e;
        const next = e + 1;
        if (next > 0 && next % 60 === 0) playBreakAlarm();
        return next;
      });
    }, 1000);

    return () => clearInterval(int$.current);
  }, [running]);

  useEffect(() => () => clearInterval(int$.current), []);

  const total    = durMin * 60;
  const progress = total > 0 ? Math.max(0, 1 - remain / total) : 1;
  const dash     = C2 * (1 - progress);

  // ── Setup ─────────────────────────────────────────────────────────────────
  if (phase === "setup") return (
    <div style={{ padding: "58px 24px 40px" }} className="slide-up">
      <div style={{ marginBottom: 36 }}>
        <div style={eyebrow}>Rest time</div>
        <h2 className="serif" style={{ fontSize: 38, color: "var(--text)", lineHeight: 1.08 }}>
          Take a break.<br />You earned it.
        </h2>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 36 }}>
        {BREAK_PRESETS.map((m) => {
          const active = durMin === m;
          return (
            <button
              key={m}
              onClick={() => setDurMin(m)}
              style={{
                flex: 1, padding: "20px 0", borderRadius: 15,
                cursor: "pointer", fontFamily: "DM Sans, sans-serif", transition: "all 0.15s",
                border:     active ? "2px solid var(--primary)"  : "1.5px solid var(--border)",
                background: active ? "var(--primary-bg)"         : "white",
              }}
            >
              <div className="serif" style={{ fontSize: 28, color: active ? "var(--primary)" : "var(--text)" }}>{m}</div>
              <div style={{ fontSize: 12, color: "var(--faint)" }}>min</div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button className="btn-primary" onClick={startBreak}>Start {durMin}m Break</button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button className="btn-secondary" onClick={onNext}>Skip Break →</button>
          <button className="btn-secondary" onClick={onEnd}>End Session</button>
        </div>
      </div>
    </div>
  );

  // ── Running ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "56px 24px 32px" }} className="fade-in">
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <span className="badge badge-faint">☕ Break Time</span>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 240, height: 240 }}>
          <svg width="240" height="240" viewBox="0 0 240 240">
            <circle cx="120" cy="120" r={R} fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle
              cx="120" cy="120" r={R} fill="none"
              stroke={over ? "var(--warning)" : "var(--primary)"}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={C2} strokeDashoffset={dash}
              className="timer-ring"
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <div
              className="serif"
              style={{ fontSize: 42, color: over ? "var(--warning)" : "var(--text)" }}
            >
              {over ? `+${fmt(extra)}` : fmt(remain)}
            </div>
            <div style={{ fontSize: 12, color: "var(--faint)" }}>
              {over ? "extra time" : "remaining"}
            </div>
          </div>
        </div>
      </div>

      {over && (
        <div style={{ textAlign: "center", marginBottom: 20, fontSize: 14, color: "var(--warning)", fontWeight: 500 }}>
          Break&apos;s up. Ready when you are.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button className="btn-primary" onClick={onNext}>Start Next Block →</button>
        <button className="btn-secondary" style={{ width: "100%" }} onClick={onEnd}>End Session</button>
      </div>
    </div>
  );
}

const eyebrow = {
  fontSize: 11, color: "var(--primary)", fontWeight: 600,
  letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8,
};
