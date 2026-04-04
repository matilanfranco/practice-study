"use client";

import { useState } from "react";
import { BLOCK_PRESETS } from "@/lib/constants";

export default function SessionSetup({ blockNum, onStart, onCancel }) {
  const [sel,    setSel]    = useState(25);
  const [custom, setCustom] = useState("");
  const [useC,   setUseC]   = useState(false);

  const dur = useC ? (parseInt(custom) || 25) : sel;

  return (
    <div style={{ padding: "56px 24px 40px" }} className="fade-in">
      <button className="btn-ghost" onClick={onCancel} style={{ marginBottom: 32 }}>
        ← {blockNum > 1 ? "Back" : "Cancel"}
      </button>

      <div style={{ marginBottom: 36 }}>
        <div style={eyebrow}>Block {blockNum}</div>
        <h1 className="serif" style={{ fontSize: 40, color: "var(--text)", lineHeight: 1.08 }}>
          How long is<br />this block?
        </h1>
        <p style={{ marginTop: 12, color: "var(--muted)", fontSize: 15 }}>
          You can always end early — or go longer.
        </p>
      </div>

      {/* Presets */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 18 }}>
        {BLOCK_PRESETS.map((m) => {
          const active = sel === m && !useC;
          return (
            <button
              key={m}
              onClick={() => { setSel(m); setUseC(false); }}
              style={{
                padding: "18px 0", borderRadius: 15, cursor: "pointer",
                fontFamily: "DM Sans, sans-serif", transition: "all 0.15s",
                border:     active ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                background: active ? "var(--primary-bg)"        : "white",
              }}
            >
              <div className="serif" style={{ fontSize: 26, color: active ? "var(--primary)" : "var(--text)" }}>{m}</div>
              <div style={{ fontSize: 12, color: "var(--faint)" }}>min</div>
            </button>
          );
        })}
      </div>

      {/* Custom input */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 13, color: "var(--faint)", marginBottom: 8 }}>Custom (minutes)</div>
        <input
          className="input"
          type="number"
          placeholder="e.g. 35"
          value={custom}
          onChange={(e) => { setCustom(e.target.value); setUseC(true); }}
          onFocus={() => setUseC(true)}
        />
      </div>

      <button className="btn-primary" onClick={() => onStart(dur * 60)}>
        Start {dur} min Block
      </button>
    </div>
  );
}

const eyebrow = {
  fontSize: 11, fontWeight: 600, color: "var(--primary)",
  letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8,
};
