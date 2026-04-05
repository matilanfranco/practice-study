"use client";

import { useApp } from "@/context/AppContext";
import { fmt, getStreak, getTodayTime, getWeekBlocks, instrEmoji, getGreeting, getStreakMessage, getWeekDots, todayStr } from "@/lib/helpers";
import { CATEGORIES } from "@/lib/constants";

export default function DashboardScreen({ onStart }) {
  const { user, blocks } = useApp();

  const streak      = getStreak(blocks);
  const todayTime   = getTodayTime(blocks);
  const weekBlocks  = getWeekBlocks(blocks);
  const todayBlocks = blocks.filter((b) => new Date(b.date).toDateString() === todayStr());
  const weekDots    = getWeekDots(blocks);
  const th = Math.floor(todayTime / 3600);
  const tm = Math.floor((todayTime % 3600) / 60);

  const achievement =
    weekBlocks === 0 ? { icon: "🌱", text: "First block of the week starts your streak" }
    : weekBlocks < 3 ? { icon: "🎯", text: `${3 - weekBlocks} more blocks to hit your weekly target` }
    : weekBlocks < 7 ? { icon: "🔥", text: `${weekBlocks} blocks this week — you're consistent` }
    :                  { icon: "🏆", text: `${weekBlocks} blocks this week. Legendary.` };

  return (
    <div style={{ paddingBottom: 100 }} className="fade-in">
      {/* ── Header ── */}
      <div style={{ padding: "58px 24px 28px", background: "linear-gradient(180deg, var(--primary-bg) 0%, var(--bg) 100%)" }}>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
          Good {getGreeting()},
        </div>
        <h2 className="serif" style={{ fontSize: 30, color: "var(--text)" }}>
          {user.name} <span style={{ fontSize: 22 }}>{instrEmoji(user.instrument)}</span>
        </h2>
        <p style={{ marginTop: 8, color: "var(--primary)", fontSize: 14, fontWeight: 500 }}>
          {getStreakMessage(streak)}
        </p>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* ── Streak card ── */}
        <div className="card fade-in" style={{ marginTop: -10, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <div style={eyebrow}>Current Streak</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span className="serif" style={{ fontSize: 44, color: "var(--text)", lineHeight: 1 }}>{streak}</span>
                <span style={{ fontSize: 16, color: "var(--muted)" }}>days</span>
              </div>
            </div>
            <span style={{ fontSize: 34 }}>{streak >= 7 ? "🔥" : streak >= 3 ? "✨" : streak >= 1 ? "💚" : "🌱"}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {weekDots.map((d, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div
                  className="week-dot"
                  style={{
                    background: d.active ? "var(--primary)" : "var(--border)",
                    outline: d.today ? "2px solid var(--primary)" : "2px solid transparent",
                    outlineOffset: 2,
                  }}
                />
                <span style={{ fontSize: 10, color: d.today ? "var(--primary)" : "var(--faint)", fontWeight: d.today ? 600 : 400 }}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats row ── */}
        {/* ── Stats row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div className="card" style={{ padding: "16px" }}>
            <div style={eyebrow}>Today</div>
            <div className="serif" style={{ fontSize: 28, color: "var(--primary)" }}>
              {todayTime === 0 ? "0 blocks" : th > 0 ? `${th}h ${tm}m` : `${tm}m`}
            </div>
            <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 2 }}>
              {todayBlocks.length} block{todayBlocks.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="card" style={{ padding: "16px" }}>
            <div style={eyebrow}>This Week</div>
            <div className="serif" style={{ fontSize: 28, color: "var(--primary)" }}>
              {weekBlocks}
            </div>
            <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 2 }}>blocks studied</div>
          </div>
        </div>

        {/* ── Achievement hint ── */}
        <div style={{ background: "var(--primary-bg)", borderRadius: 14, padding: "13px 18px", marginBottom: 22, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>{achievement.icon}</span>
          <div style={{ fontSize: 13, color: "var(--primary)", fontWeight: 500 }}>{achievement.text}</div>
        </div>

        {/* ── CTA ── */}
        <button className="btn-primary" style={{ fontSize: 17, padding: "19px", borderRadius: 17 }} onClick={onStart}>
          Start Practice Block
        </button>

        {blocks.length > 0 && (
          <div style={{ marginTop: 11, textAlign: "center", fontSize: 13, color: "var(--faint)" }}>
            Last:{" "}
            {new Date(blocks[0].date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            {" · "}
            {CATEGORIES.find((c) => c.id === blocks[0].category)?.label || "Practice"}
          </div>
        )}
      </div>
    </div>
  );
}

const eyebrow = {
  fontSize: 11, color: "var(--faint)", fontWeight: 600,
  letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8,
};
