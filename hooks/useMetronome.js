"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createMetronomeTick } from "@/lib/sounds";

export function useMetronome() {
  const [isOn,  setIsOn]  = useState(false);
  const [bpm,   setBpmS]  = useState(120);
  const [wave,  setWaveS] = useState("sine");
  const [beat,  setBeat]  = useState(false);

  const ctx$  = useRef(null);
  const next$ = useRef(0);
  const tid$  = useRef(null);
  const st$   = useRef({ bpm: 120, wave: "sine", on: false });

  const getCtx = () => {
    if (!ctx$.current)
      ctx$.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctx$.current;
  };

  const tick = useRef(null);
  tick.current = () => {
    if (!st$.current.on) return;
    const ctx = getCtx();
    while (next$.current < ctx.currentTime + 0.12) {
      createMetronomeTick(ctx, next$.current, st$.current.wave);
      const when = next$.current;
      setTimeout(
        () => setBeat((b) => !b),
        Math.max(0, (when - ctx.currentTime) * 1000)
      );
      next$.current += 60 / st$.current.bpm;
    }
    tid$.current = setTimeout(() => tick.current(), 20);
  };

  const start = useCallback(() => {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
    st$.current.on = true;
    next$.current  = ctx.currentTime + 0.05;
    tick.current();
    setIsOn(true);
  }, []);

  const stop = useCallback(() => {
    st$.current.on = false;
    clearTimeout(tid$.current);
    setIsOn(false);
  }, []);

  const toggle = useCallback(
    () => (st$.current.on ? stop() : start()),
    [start, stop]
  );

  const setBpm = useCallback((v) => {
    const clamped = Math.max(20, Math.min(300, v));
    st$.current.bpm = clamped;
    setBpmS(clamped);
  }, []);

  const setWave = useCallback((w) => {
    st$.current.wave = w;
    setWaveS(w);
  }, []);

  useEffect(() => () => {
  st$.current.on = false;
  clearTimeout(tid$.current);
  setIsOn(false);
}, []);

  return { isOn, toggle, start, stop, bpm, setBpm, wave, setWave, beat };
}
