const getCtx = () =>
  new (window.AudioContext || window.webkitAudioContext)();

export const playAlarm = (freq = 660, type = "sine", times = 3) => {
  try {
    const ctx = getCtx();
    Array.from({ length: times }).forEach((_, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = freq;
      o.type = type;
      const t = ctx.currentTime + i * 0.28;
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.start(t);
      o.stop(t + 0.25);
    });
  } catch (_) {}
};

export const playBreakAlarm = () => playAlarm(528, "sine", 3);
export const playBlockAlarm = () => playAlarm(660, "sine", 3);

export const createMetronomeTick = (ctx, time, waveform = "sine") => {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g);
  g.connect(ctx.destination);
  o.type = waveform;
  o.frequency.value = 880;
  g.gain.setValueAtTime(0.4, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
  o.start(time);
  o.stop(time + 0.08);
};
