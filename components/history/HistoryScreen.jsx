"use client";

import { useApp } from "@/context/AppContext";
import { CATEGORIES } from "@/lib/constants";
import { fmt } from "@/lib/helpers";

export default function HistoryScreen() {
  const { blocks } = useApp();

  const grouped = blocks.reduce((acc, b) => {
    const day = new Date(b.date).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(b);
    return acc;
  }, {});

  return (
    <div className="screen fade-in">
      <h2 className="serif" style={{ fontSize: 36, marginBottom: 6 }}>Journal</h2>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 28 }}>Your practice history</p>

      {blocks.length === 0 ? (
        <EmptyState />
      ) : (
        Object.entries(grouped).map(([date, dayBlocks]) => (
          <DayGroup key={date} date={date} blocks={dayBlocks} />
        ))
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📒</div>
      <div className="serif" style={{ fontSize: 24, color: "var(--text)", marginBottom: 8 }}>
        Nothing here yet
      </div>
      <div style={{ color: "var(--faint)", fontSize: 14 }}>
        Complete your first block to see your history
      </div>
    </div>
  );
}

function DayGroup({ date, blocks }) {
  const total = blocks.reduce((s, b) => s + (b.duration || 0), 0);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
          {new Date(date).toLocaleDateString("en-US", {
            weekday: "long", month: "short", day: "numeric",
          })}
        </div>
        <div style={{ fontSize: 12, color: "var(--faint)" }}>{fmt(total)} total</div>
      </div>

      {blocks.map((b, i) => (
        <BlockCard key={b.id || i} block={b} index={i} />
      ))}
    </div>
  );
}

function BlockCard({ block, index }) {
  // Support both old (category: string) and new (categories: array) format
  const categoryIds = block.categories
    ? block.categories
    : block.category
    ? [block.category]
    : [];

  const cats = categoryIds
    .map((id) => CATEGORIES.find((c) => c.id === id))
    .filter(Boolean);

  const ratings = [block.focus, block.dexterity].filter(Boolean);
  const avgRating =
    ratings.length
      ? (ratings.reduce((s, v) => s + v, 0) / ratings.length).toFixed(1)
      : null;

  return (
    <div className="card" style={{ marginBottom: 8, padding: "15px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>

          {/* Categories */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            {cats.map((cat) => (
              <span
                key={cat.id}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 13, fontWeight: 600, color: "var(--text)",
                  background: "var(--primary-bg)", borderRadius: 100,
                  padding: "3px 10px", border: "1px solid var(--primary-xl)",
                }}
              >
                {cat.emoji} {cat.label}
              </span>
            ))}
          </div>

          {/* Description */}
          {block.description && (
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6, lineHeight: 1.4 }}>
              {block.description}
            </div>
          )}

          {/* Ratings */}
          <div style={{ display: "flex", gap: 14 }}>
            {block.focus > 0 && (
              <span style={{ fontSize: 12, color: "var(--faint)" }}>
                Focus {"★".repeat(block.focus)}{"☆".repeat(5 - block.focus)}
              </span>
            )}
            {block.dexterity > 0 && (
              <span style={{ fontSize: 12, color: "var(--faint)" }}>
                Dex {"★".repeat(block.dexterity)}{"☆".repeat(5 - block.dexterity)}
              </span>
            )}
          </div>
        </div>

        {/* Time + avg */}
        <div style={{ textAlign: "right", marginLeft: 12, flexShrink: 0 }}>
          <div className="serif" style={{ fontSize: 20, color: "var(--primary)" }}>
            {fmt(block.duration || 0)}
          </div>
          {avgRating && (
            <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2 }}>
              ★ {avgRating} avg
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {block.notes && (
        <div style={{
          marginTop: 10, padding: "8px 12px",
          background: "var(--bg)", borderRadius: 8,
          fontSize: 12, color: "var(--muted)", lineHeight: 1.5,
        }}>
          {block.notes}
        </div>
      )}
    </div>
  );
}