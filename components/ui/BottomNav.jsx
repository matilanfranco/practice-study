"use client";

const TABS = [
  { id: "dashboard", icon: "⌂", label: "Home"    },
  { id: "history",   icon: "◷", label: "Journal" },
  { id: "profile",   icon: "◉", label: "Profile" },
];

export default function BottomNav({ active, onNavigate }) {
  return (
    <nav className="bottom-nav">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`nav-tab ${active === t.id ? "active" : ""}`}
          onClick={() => onNavigate(t.id)}
        >
          <span style={{ fontSize: 22, color: active === t.id ? "var(--primary)" : "var(--faint)" }}>
            {t.icon}
          </span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
