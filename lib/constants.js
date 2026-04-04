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
  { id: 1,  title: "10 Arreglos para Ensamble",           author: "Andrés Pilar",    category: "Repertorio",  filename: "10 Arreglos para Ensamble Andrés Pilar.pdf" },
  { id: 2,  title: "23 Jazz Standard Reharms",            author: "Holger Marjama",  category: "Armonía",     filename: "23 Jazz Standard Reharms.pdf" },
  { id: 3,  title: "Advanced Harmonic Techniques",        author: "Holger Marjama",  category: "Armonía",     filename: "Advanced Harmonic Techniques for Jazz Musicians.pdf" },
  { id: 4,  title: "Aebersold Vol. 2 — Nothin But Blues", author: "Jamey Aebersold", category: "Blues",       filename: "Aebersold - vol 2 - nothin but blues.pdf" },
  { id: 5,  title: "Aebersold Vol. 28 — Giant Steps",     author: "Jamey Aebersold", category: "Jazz",        filename: "Aebersold - vol 28 - John Coltrane - giant steps.pdf" },
  { id: 6,  title: "Aebersold Vol. 3 — ii-V7-I",          author: "Jamey Aebersold", category: "Teoría",      filename: "Aebersold - vol 3 - The ii-v7-i progression.pdf" },
  { id: 7,  title: "Aebersold Vol. 84 — Dominant 7th",    author: "Jamey Aebersold", category: "Teoría",      filename: "Aebersold - vol 84 - Dominant seventh.pdf" },
  { id: 8,  title: "Aebersold Vol. 24",                   author: "Jamey Aebersold", category: "Jazz",        filename: "Aebersold - volume 24.pdf" },
  { id: 9,  title: "Bebop Workbook",                      author: "Cecil Alexander", category: "Bebop",       filename: "Bebop Workbook - Treble and TAB.pdf" },
  { id: 10, title: "Blues Pentatonics",                   author: "Peter Martin",    category: "Blues",       filename: "Blues Pentatonics – Peter Martin.pdf" },
  { id: 11, title: "How to Play Bebop",                   author: "David Baker",     category: "Bebop",       filename: "David baker - how to play bebop.pdf" },
  { id: 12, title: "Piano Transcriptions",                author: "Horacio Salgan",  category: "Repertorio",  filename: "Horacio Salgan - piano transcriptions.pdf" },
  { id: 13, title: "Pentatonics Vol. 2",                  author: "Jerry Bergonzi",  category: "Improvisación", filename: "Inside improvisation - vol 2 - Pentatonics - Jerry Bergonzi.pdf" },
  { id: 14, title: "Jazz Hanon",                          author: "Peter Deneff",    category: "Técnica",     filename: "Jazz Hanon - Peter Deneff.pdf" },
  { id: 15, title: "Patterns for Jazz",                   author: "Jerry Coker",     category: "Improvisación", filename: "Jerry Coker - Patterns for Jazz.pdf" },
  { id: 16, title: "Tango para Intermedios",              author: "Pablo Estigarribia", category: "Repertorio",  filename: "TANGO para intermedios.pdf" },
  { id: 17, title: "Bud Powell & Modern Jazz",            author: "David Joseph DeMotta", category: "Historia",    filename: "The contributions of earl - Bud powell to the modern jazz style.pdf" },
  { id: 18, title: "The Latin Real Book",                 author: "",                category: "Repertorio",  filename: "The latin realbook.pdf" },
  { id: 19, title: "Turnarounds & Cycles Vol. 16",        author: "Jamey Aebersold", category: "Armonía",     filename: "Vol 16 - turnarounds cycles.pdf" },
  { id: 20, title: "Wayne Shorter — Compositions",        author: "Steven Strunk",   category: "Repertorio",  filename: "Wayne shorter - compositions.pdf" },
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
