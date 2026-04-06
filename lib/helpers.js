export const fmt = (s) => {
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

export const todayStr = () => new Date().toDateString();

export const dayLabel = (d) => ["S", "M", "T", "W", "T", "F", "S"][new Date(d).getDay()];

export const getStreak = (blocks) => {
  if (!blocks.length) return 0;
  const days  = [...new Set(blocks.map((b) => new Date(b.date).toDateString()))];
  let streak  = 0;
  const check = new Date();
  for (let i = 0; i < 365; i++) {
    if (days.includes(check.toDateString())) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else if (i === 0) {
      check.setDate(check.getDate() - 1);
    } else break;
  }
  return streak;
};

export const getTodayTime = (blocks) =>
  blocks
    .filter((b) => new Date(b.date).toDateString() === todayStr())
    .reduce((s, b) => s + (b.duration || 0), 0);

export const getWeekBlocks = (blocks) => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return blocks.filter((b) => new Date(b.date) > weekAgo).length;
};

export const instrEmoji = (ins) =>
  ({
    Guitar: "🎸", Bass: "🎸", Piano: "🎹", Drums: "🥁",
    Voice: "🎤", Violin: "🎻", Cello: "🎻", Saxophone: "🎷", Trumpet: "🎺",
  })[ins] || "🎵";

export const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
};

export const getStreakMessage = (streak) => {
  if (streak === 0) return "Start your streak today.";
  if (streak === 1) return "You showed up. That's everything. 😊";
  if (streak < 4)  return `${streak} days strong. Keep going. 💪`;
  if (streak < 7)  return `${streak} day streak 🔥 You're building something real.`;
  return `${streak} days. You're a force. 🔥`;
};

export const getWeekDots = (blocks) => {
  const now = new Date();
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return {
      label:  dayLabel(d),
      active: blocks.some((b) => new Date(b.date).toDateString() === d.toDateString()),
      today:  i === 6,
    };
  });
};
