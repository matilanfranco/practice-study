"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { INSTRUMENTS, CATEGORIES, ACHIEVEMENTS } from "@/lib/constants";
import { fmt, getStreak, getTodayTime, getWeekBlocks, instrEmoji } from "@/lib/helpers";

export default function ProfileScreen() {
  const { user, blocks, updateUser, logout } = useApp();
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({ name: user.name, age: user.age, instrument: user.instrument });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const streak     = getStreak(blocks);
  const todayTime  = getTodayTime(blocks);
  const weekBlocks = getWeekBlocks(blocks);
  const totalTime  = blocks.reduce((s, b) => s + (b.duration || 0), 0);

  const focusBlocks = blocks.filter((b) => b.focus > 0);
  const avgFocus    = focusBlocks.length
    ? focusBlocks.reduce((s, b) => s + b.focus, 0) / focusBlocks.length
    : 0;

  const catBreakdown = CATEGORIES
    .map((c) => ({
      ...c,
      time:  blocks.filter((b) => b.category === c.id).reduce((s, b) => s + (b.duration || 0), 0),
      count: blocks.filter((b) => b.category === c.id).length,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.time - a.time);

  const maxTime = catBreakdown.length ? Math.max(...catBreakdown.map((c) => c.time)) : 1;

  const earned = ACHIEVEMENTS.map((a) => ({
    ...a,
    earned: a.check(blocks, streak, weekBlocks, todayTime),
  }));

  const save = () => {
    updateUser({ ...user, ...form, age: parseInt(form.age) });
    setEditing(false);
  };

  return (
    <div className="screen fade-in">
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 }}>
        <div>
          <div style={avatarStyle}>{instrEmoji(user.instrument)}</div>
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
              <input className="input" value={form.name}       onChange={set("name")}       placeholder="Name"       style={{ fontSize: 14 }} />
              <input className="input" type="number" value={form.age}  onChange={set("age")}  placeholder="Age"        style={{ fontSize: 14 }} />
              <select className="input" value={form.instrument} onChange={set("instrument")} style={{ fontSize: 14 }}>
                {INSTRUMENTS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-primary" style={{ padding: "10px 20px", fontSize: 14 }} onClick={save}>Save</button>
                <button className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="serif" style={{ fontSize: 28 }}>{user.name}</h2>
              <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
                {user.instrument} · {user.age} years old
              </div>
            </>
          )}
        </div>
        {!editing && (
          <button className="btn-ghost" onClick={() => setEditing(true)}>Edit</button>
        )}
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Total",  value: totalTime >= 3600 ? `${Math.floor(totalTime / 3600)}h` : `${Math.floor(totalTime / 60)}m` },
          { label: "Blocks", value: blocks.length },
          { label: "Streak", value: `${streak}d` },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: "14px 8px" }}>
            <div className="serif" style={{ fontSize: 26, color: "var(--primary)" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Avg focus ── */}
      {avgFocus > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={sectionLabel}>Average Focus</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--primary)", fontSize: 20 }}>
              {"★".repeat(Math.round(avgFocus))}{"☆".repeat(5 - Math.round(avgFocus))}
            </span>
            <span style={{ fontSize: 14, color: "var(--muted)" }}>{avgFocus.toFixed(1)}/5</span>
          </div>
        </div>
      )}

      {/* ── Category breakdown ── */}
      {catBreakdown.length > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={sectionLabel}>Time by Category</div>
          {catBreakdown.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>{c.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{c.label}</span>
                  <span style={{ fontSize: 13, color: "var(--faint)" }}>{fmt(c.time)}</span>
                </div>
                <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
                  <div style={{ height: "100%", borderRadius: 2, background: "var(--primary)", width: `${(c.time / maxTime) * 100}%`, transition: "width 0.6s ease" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Achievements ── */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={sectionLabel}>Achievements</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {earned.map((a) => (
            <div
              key={a.id}
              style={{
                textAlign: "center", padding: "12px 6px", borderRadius: 12,
                background: a.earned ? "var(--primary-bg)" : "var(--bg)",
                border: `1px solid ${a.earned ? "var(--primary-xl)" : "var(--border)"}`,
                opacity: a.earned ? 1 : 0.45,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 5 }}>{a.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: a.earned ? "var(--primary)" : "var(--faint)", lineHeight: 1.3 }}>
                {a.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-ghost" onClick={logout} style={{ color: "var(--danger)", fontSize: 14 }}>
        Sign Out
      </button>
    </div>
  );
}

const avatarStyle = {
  width: 58, height: 58, borderRadius: "50%",
  background: "var(--primary-bg)", display: "flex",
  alignItems: "center", justifyContent: "center",
  fontSize: 24, marginBottom: 12,
  border: "2px solid var(--primary-xl)",
};

const sectionLabel = {
  fontSize: 11, color: "var(--faint)", fontWeight: 600,
  letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14,
};
