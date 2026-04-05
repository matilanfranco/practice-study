"use client";

import { WAVEFORMS } from "@/lib/constants";

export default function MetronomePanel({ metro, expanded, onToggleExpand }) {
  return (
    <div>
      {/* ── Compact bar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 100, padding: "9px 14px",
      }}>
        <button
          onClick={metro.toggle}
          style={{
            width: 36, height: 36, borderRadius: "50%", border: "none",
            cursor: "pointer", fontSize: 17, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
            background: metro.isOn ? "var(--primary)" : "var(--primary-bg)",
            color:      metro.isOn ? "white"          : "var(--primary)",
          }}
        >
          ♩
        </button>

        <button onClick={() => metro.setBpm(metro.bpm - 1)} style={bpmBtnStyle}>−</button>

        <div style={{ flex: 1, textAlign: "center" }}>
          <span className="serif" style={{ fontSize: 20, color: "var(--text)" }}>{metro.bpm}</span>
          <span style={{ fontSize: 11, color: "var(--faint)", marginLeft: 3 }}>BPM</span>
        </div>

        <button onClick={() => metro.setBpm(metro.bpm + 1)} style={bpmBtnStyle}>+</button>

        <button onClick={onToggleExpand} className="btn-ghost" style={{ fontSize: 16, padding: "0 2px" }}>
          {expanded ? "▾" : "▸"}
        </button>
      </div>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div className="card-sm fade-in" style={{ marginTop: 8, borderRadius: 14, display: "flex", flexDirection: "column", gap: 18 }}>

          {/* BPM slider */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={sectionLabel}>BPM</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>{metro.bpm}</span>
            </div>
            <input
              type="range" min="20" max="300" step="1"
              value={metro.bpm}
              onChange={e => metro.setBpm(parseInt(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--faint)", marginTop: 3 }}>
              <span>20</span><span>160</span><span>300</span>
            </div>
          </div>

          {/* Pitch slider */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={sectionLabel}>Pitch</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>{metro.pitch} Hz</span>
            </div>
            <input
              type="range" min="220" max="1760" step="10"
              value={metro.pitch}
              onChange={e => metro.setPitch(parseInt(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--faint)", marginTop: 3 }}>
              <span>Low</span><span>Mid</span><span>High</span>
            </div>
          </div>

          {/* Volume slider */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={sectionLabel}>Volume</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>
                {Math.round(metro.volume * 100)}%
              </span>
            </div>
            <input
              type="range" min="0.05" max="1" step="0.05"
              value={metro.volume}
              onChange={e => metro.setVolume(parseFloat(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--faint)", marginTop: 3 }}>
              <span>Quiet</span><span>Mid</span><span>Loud</span>
            </div>
          </div>

          {/* Waveform */}
          <div>
            <div style={{ ...sectionLabel, marginBottom: 8 }}>Waveform</div>
            <div style={{ display: "flex", gap: 7 }}>
              {WAVEFORMS.map(w => (
                <button
                  key={w}
                  onClick={() => metro.setWave(w)}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 10,
                    cursor: "pointer", fontFamily: "DM Sans, sans-serif",
                    transition: "all 0.15s", fontSize: 12, fontWeight: 600,
                    border:     metro.wave === w ? "2px solid var(--primary)"  : "1.5px solid var(--border)",
                    background: metro.wave === w ? "var(--primary-bg)"         : "white",
                    color:      metro.wave === w ? "var(--primary)"             : "var(--muted)",
                  }}
                >
                  {w === "sine" ? "∿ Sine" : w === "square" ? "⊓ Square" : "∧ Tri"}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

const bpmBtnStyle = {
  width: 30, height: 30, borderRadius: "50%",
  background: "var(--primary-bg)", border: "none",
  cursor: "pointer", color: "var(--primary)",
  fontSize: 18, fontWeight: 700,
  display: "flex", alignItems: "center", justifyContent: "center",
};

const sectionLabel = {
  fontSize: 11, color: "var(--faint)", fontWeight: 600,
  letterSpacing: "0.1em", textTransform: "uppercase",
};