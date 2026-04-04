"use client";

export default function StarRating({ value, onChange, label }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, marginBottom: 9 }}>
        {label}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`star ${n <= value ? "on" : ""}`}
            onClick={() => onChange(n)}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
}
