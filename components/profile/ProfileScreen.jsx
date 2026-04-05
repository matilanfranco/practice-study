"use client";

import { useState, useEffect } from "react";
import { useApp }              from "@/context/AppContext";
import { INSTRUMENTS, CATEGORIES, ACHIEVEMENTS, PDF_LIST } from "@/lib/constants";
import { fmt, getStreak, getTodayTime, getWeekBlocks, instrEmoji } from "@/lib/helpers";
import { requestNotificationPermission, scheduleReminderNotification, cancelReminder, getReminderHour } from "@/lib/notifications";

export default function ProfileScreen() {
  const { user, blocks, updateUser, logout } = useApp();
  const [editing,        setEditing]        = useState(false);
  const [form,           setForm]           = useState({ name: user.name, age: user.age, instrument: user.instrument });
  const [notifEnabled,   setNotifEnabled]   = useState(Notification?.permission === "granted");
  const [reminderHour,   setReminderHour]   = useState(getReminderHour() || "18:00");
  const [notifSaved,     setNotifSaved]     = useState(!!getReminderHour());
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const streak     = getStreak(blocks);
  const todayTime  = getTodayTime(blocks);
  const weekBlocks = getWeekBlocks(blocks);
  const totalTime  = blocks.reduce((s, b) => s + (b.duration || 0), 0);

  // ── Insights ──────────────────────────────────────────────────────────────
  const focusBlocks = blocks.filter(b => b.focus > 0);
  const avgFocus    = focusBlocks.length
    ? (focusBlocks.reduce((s, b) => s + b.focus, 0) / focusBlocks.length)
    : 0;

  const dexBlocks = blocks.filter(b => b.dexterity > 0);
  const avgDex    = dexBlocks.length
    ? (dexBlocks.reduce((s, b) => s + b.dexterity, 0) / dexBlocks.length)
    : 0;

  // Average block duration
  const avgDuration = blocks.length
    ? Math.floor(blocks.reduce((s, b) => s + (b.duration || 0), 0) / blocks.length)
    : 0;

  // Best study hour
  const hourMap = blocks.reduce((acc, b) => {
    const h = new Date(b.date).getHours();
    acc[h] = (acc[h] || 0) + 1;
    return acc;
  }, {});
  const bestHour = Object.keys(hourMap).length
    ? Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0][0]
    : null;
  const bestHourLabel = bestHour !== null
    ? `${bestHour}:00 – ${parseInt(bestHour) + 1}:00`
    : null;

  // Category breakdown
  const catBreakdown = CATEGORIES
    .map(c => ({
      ...c,
      time:     blocks.filter(b => (b.categories || [b.category]).includes(c.id)).reduce((s, b) => s + (b.duration || 0), 0),
      count:    blocks.filter(b => (b.categories || [b.category]).includes(c.id)).length,
      avgFocus: (() => {
        const cb = blocks.filter(b => (b.categories || [b.category]).includes(c.id) && b.focus > 0);
        return cb.length ? cb.reduce((s, b) => s + b.focus, 0) / cb.length : 0;
      })(),
    }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.time - a.time);

  const maxTime = catBreakdown.length ? Math.max(...catBreakdown.map(c => c.time)) : 1;

  // Most used PDFs
  const pdfMap = blocks
    .filter(b => b.usedPdf && b.pdfsUsed?.length)
    .flatMap(b => b.pdfsUsed)
    .reduce((acc, id) => { acc[id] = (acc[id] || 0) + 1; return acc; }, {});
  const topPdfs = Object.entries(pdfMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, count]) => ({ pdf: PDF_LIST.find(p => p.id === parseInt(id)), count }))
    .filter(x => x.pdf);

  // Achievements
  const earned = ACHIEVEMENTS.map(a => ({
    ...a,
    earned: a.check(blocks, streak, weekBlocks, todayTime),
  }));

  // ── Handlers ──────────────────────────────────────────────────────────────
  const save = () => {
    updateUser({ ...user, ...form, age: parseInt(form.age) });
    setEditing(false);
  };

  const handleNotifToggle = async () => {
    if (notifEnabled) {
      cancelReminder();
      setNotifEnabled(false);
      setNotifSaved(false);
    } else {
      const granted = await requestNotificationPermission();
      setNotifEnabled(granted);
      if (!granted) alert("Enable notifications in your browser settings.");
    }
  };

  const handleSaveReminder = () => {
    scheduleReminderNotification(reminderHour);
    setNotifSaved(true);
  };

  const totalH = Math.floor(totalTime / 3600);
  const totalM = Math.floor((totalTime % 3600) / 60);

  return (
    <div className="screen fade-in" style={{ maxWidth: 680, margin: "0 auto" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={avatarStyle}>{instrEmoji(user.instrument)}</div>
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              <input className="input" value={form.name}       onChange={set("name")}       placeholder="Name"   style={{ fontSize: 14 }} />
              <input className="input" type="number" value={form.age}  onChange={set("age")}  placeholder="Age"    style={{ fontSize: 14 }} />
              <select className="input" value={form.instrument} onChange={set("instrument")} style={{ fontSize: 14 }}>
                {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
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
        {!editing && <button className="btn-ghost" onClick={() => setEditing(true)}>Edit</button>}
      </div>

      {/* ── Top stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Total",   value: totalTime >= 3600 ? `${totalH}h ${totalM}m` : `${Math.floor(totalTime / 60)}m` },
          { label: "Blocks",  value: blocks.length },
          { label: "Streak",  value: `${streak}d` },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: "14px 8px" }}>
            <div className="serif" style={{ fontSize: 26, color: "var(--primary)" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Insights ── */}
      {blocks.length >= 3 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={sectionLabel}>Insights</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            {avgFocus > 0 && (
              <div>
                <div style={{ fontSize: 12, color: "var(--faint)", marginBottom: 4 }}>Avg. Focus</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--primary)", fontSize: 16 }}>
                    {"★".repeat(Math.round(avgFocus))}{"☆".repeat(5 - Math.round(avgFocus))}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{avgFocus.toFixed(1)}</span>
                </div>
              </div>
            )}

            {avgDex > 0 && (
              <div>
                <div style={{ fontSize: 12, color: "var(--faint)", marginBottom: 4 }}>Avg. Dexterity</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--primary)", fontSize: 16 }}>
                    {"★".repeat(Math.round(avgDex))}{"☆".repeat(5 - Math.round(avgDex))}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{avgDex.toFixed(1)}</span>
                </div>
              </div>
            )}

            {avgDuration > 0 && (
              <div>
                <div style={{ fontSize: 12, color: "var(--faint)", marginBottom: 4 }}>Avg. Block</div>
                <div className="serif" style={{ fontSize: 22, color: "var(--text)" }}>{fmt(avgDuration)}</div>
              </div>
            )}

            {bestHourLabel && (
              <div>
                <div style={{ fontSize: 12, color: "var(--faint)", marginBottom: 4 }}>Best time</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{bestHourLabel}</div>
              </div>
            )}
          </div>

          {/* Focus insight message */}
          {avgFocus > 0 && avgDuration > 0 && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--primary-bg)", borderRadius: 10 }}>
              <div style={{ fontSize: 13, color: "var(--primary)", lineHeight: 1.5 }}>
                {avgFocus >= 4
                  ? `Your focus is excellent — ${avgFocus.toFixed(1)}/5 average. Keep your blocks around ${fmt(avgDuration)}.`
                  : avgFocus >= 3
                  ? `Solid focus at ${avgFocus.toFixed(1)}/5. Try shorter blocks if concentration dips.`
                  : `Focus averaging ${avgFocus.toFixed(1)}/5. Consider shorter, more intense blocks.`
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Category breakdown ── */}
      {catBreakdown.length > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={sectionLabel}>Time by Category</div>
          {catBreakdown.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{c.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{c.label}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {c.avgFocus > 0 && (
                      <span style={{ fontSize: 11, color: "var(--faint)" }}>
                        ★ {c.avgFocus.toFixed(1)}
                      </span>
                    )}
                    <span style={{ fontSize: 13, color: "var(--faint)" }}>{fmt(c.time)}</span>
                  </div>
                </div>
                <div style={{ height: 5, background: "var(--border)", borderRadius: 3 }}>
                  <div style={{
                    height: "100%", borderRadius: 3, background: "var(--primary)",
                    width: `${(c.time / maxTime) * 100}%`, transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Most used materials ── */}
      {topPdfs.length > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={sectionLabel}>Most used materials</div>
          {topPdfs.map(({ pdf, count }) => (
            <div key={pdf.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>📄 {pdf.title}</div>
                {pdf.author && <div style={{ fontSize: 11, color: "var(--faint)" }}>{pdf.author}</div>}
              </div>
              <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600, background: "var(--primary-bg)", padding: "3px 10px", borderRadius: 100 }}>
                {count}x
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Achievements ── */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={sectionLabel}>Achievements</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {earned.map(a => (
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

      {/* ── Notifications ── */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={sectionLabel}>Practice reminder</div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Daily reminder</div>
            <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 2 }}>
              {notifEnabled ? "Notifications enabled" : "Get notified to practice"}
            </div>
          </div>
          <button
            onClick={handleNotifToggle}
            style={{
              padding: "8px 16px", borderRadius: 100, cursor: "pointer",
              fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 600,
              border:     notifEnabled ? "1.5px solid var(--primary)"  : "1.5px solid var(--border)",
              background: notifEnabled ? "var(--primary-bg)"           : "white",
              color:      notifEnabled ? "var(--primary)"              : "var(--muted)",
            }}
          >
            {notifEnabled ? "On" : "Off"}
          </button>
        </div>

        {notifEnabled && (
          <div className="fade-in">
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Remind me at</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="time"
                className="input"
                value={reminderHour}
                onChange={e => setReminderHour(e.target.value)}
                style={{ flex: 1, fontSize: 16 }}
              />
              <button
                className="btn-primary"
                style={{ padding: "13px 20px", fontSize: 14, width: "auto" }}
                onClick={handleSaveReminder}
              >
                {notifSaved ? "✓ Saved" : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>

      <button className="btn-ghost" onClick={logout} style={{ color: "var(--danger)", fontSize: 14, marginBottom: 20 }}>
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