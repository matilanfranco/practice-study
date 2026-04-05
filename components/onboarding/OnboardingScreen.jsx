"use client";

import { useState } from "react";

const STEPS = [
  {
    icon: "⏱",
    title: "Study in blocks",
    description: "Each practice session is made up of focused blocks. You decide how long — 20, 45, or 60 minutes. No pressure, no strict rules.",
  },
  {
    icon: "📝",
    title: "Log what you practiced",
    description: "When a block ends, you quickly note what you worked on — technique, repertoire, theory. Rate your focus and dexterity.",
  },
  {
    icon: "☕",
    title: "Rest between blocks",
    description: "After each block, take a real break. The app times it for you. When you're ready, start the next block.",
  },
  {
    icon: "🔥",
    title: "Build your streak",
    description: "Every day you practice counts. The app tracks your streaks, weekly goals, and progress over time. Showing up is everything.",
  },
];

export default function OnboardingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const s = STEPS[step];

  return (
    <div
      className="ps-app fade-in"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 32px 48px",
        background: "var(--bg)",
      }}
    >
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 24 : 8,
              height: 8,
              borderRadius: 100,
              background: i === step ? "var(--primary)" : "var(--border)",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 24 }}>
        <div style={{
          width: 96, height: 96, borderRadius: "50%",
          background: "var(--primary-bg)", border: "2px solid var(--primary-xl)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 42,
        }}>
          {s.icon}
        </div>

        <div>
          <h2
            className="serif"
            style={{ fontSize: 34, color: "var(--text)", marginBottom: 16, lineHeight: 1.1 }}
          >
            {s.title}
          </h2>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.65, maxWidth: 320, margin: "0 auto" }}>
            {s.description}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          className="btn-primary"
          style={{ fontSize: 16, padding: "18px" }}
          onClick={() => isLast ? onDone() : setStep(s => s + 1)}
        >
          {isLast ? "Let's go 🎵" : "Continue"}
        </button>
        {!isLast && (
          <button
            className="btn-ghost"
            style={{ textAlign: "center", color: "var(--faint)" }}
            onClick={onDone}
          >
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
}