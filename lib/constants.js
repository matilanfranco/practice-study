export const INSTRUMENTS = [
  "Guitar","Bass","Piano","Violin","Cello","Viola",
  "Drums","Voice","Trumpet","Saxophone","Flute",
  "Clarinet","Ukulele","Harp","Banjo","Mandolin","Other",
];

export const CATEGORIES = [
  { id: "technique",  label: "Técnica",       emoji: "🎯" },
  { id: "impro",      label: "Improvisación",  emoji: "✨" },
  { id: "repertoire", label: "Repertorio",     emoji: "🎵" },
  { id: "theory",     label: "Teoría",         emoji: "📚" },
  { id: "other",      label: "Otro",           emoji: "🎸" },
];

export const BLOCK_PRESETS = [15, 20, 25, 30, 45, 60];
export const BREAK_PRESETS = [5, 10, 15];

export const PDF_LIST = [
  { id: 1, title: "Major Scale Positions",  category: "Scales",     pages: 3 },
  { id: 2, title: "Circle of Fifths",       category: "Theory",     pages: 1 },
  { id: 3, title: "Blues Licks Vol. 1",     category: "Repertoire", pages: 5 },
  { id: 4, title: "Chord Voicings",         category: "Technique",  pages: 4 },
  { id: 5, title: "Pentatonic Patterns",    category: "Scales",     pages: 2 },
  { id: 6, title: "Sight Reading Etudes",   category: "Theory",     pages: 6 },
];

export const WAVEFORMS = ["sine", "square", "triangle"];

export const ACHIEVEMENTS = [
  { id: "first_block",  icon: "🌱", label: "First Block",  check: (b) => b.length >= 1 },
  { id: "streak_3",     icon: "🎯", label: "3 Day Streak", check: (_, s) => s >= 3 },
  { id: "streak_7",     icon: "🔥", label: "7 Day Streak", check: (_, s) => s >= 7 },
  { id: "ten_blocks",   icon: "⚡", label: "10 Blocks",    check: (b) => b.length >= 10 },
  { id: "week_5",       icon: "🏆", label: "5 Days/Week",  check: (_, __, wb) => wb >= 5 },
  { id: "hour_today",   icon: "💎", label: "1h Today",     check: (_, __, ___, t) => t >= 3600 },
];
