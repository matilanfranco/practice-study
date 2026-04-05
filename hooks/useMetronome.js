"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createMetronomeTick } from "@/lib/sounds";

export function useMetronome() {
  const [isOn,   setIsOn]   = useState(false);
  const [bpm,    setBpmS]   = useState(120);
  const [wave,   setWaveS]  = useState("sine");
  const [beat,   setBeat]   = useState(false);
  const [pitch,  setPitchS] = useState(880);
  const [volume, setVolumeS] = useState(0.4);

  const ctx$  = useRef(null);
  const next$ = useRef(0);
  const tid$  = useRef(null);
  const st$   = useRef({ bpm: 120, wave: "sine", on: false, pitch: 880, volume: 0.4 });

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
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = st$.current.wave;
      o.frequency.value = st$.current.pitch;
      g.gain.setValueAtTime(st$.current.volume, next$.current);
      g.gain.exponentialRampToValueAtTime(0.001, next$.current + 0.07);
      o.start(next$.current);
      o.stop(next$.current + 0.08);
      const when = next$.current;
      setTimeout(() => setBeat(b => !b), Math.max(0, (when - ctx.currentTime) * 1000));
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

  const toggle = useCallback(() => (st$.current.on ? stop() : start()), [start, stop]);

  const setBpm = useCallback((v) => {
    const c = Math.max(20, Math.min(300, v));
    st$.current.bpm = c;
    setBpmS(c);
  }, []);

  const setWave = useCallback((w) => {
    st$.current.wave = w;
    setWaveS(w);
  }, []);

  const setPitch = useCallback((v) => {
    st$.current.pitch = v;
    setPitchS(v);
  }, []);

  const setVolume = useCallback((v) => {
    st$.current.volume = v;
    setVolumeS(v);
  }, []);

  useEffect(() => () => {
    st$.current.on = false;
    clearTimeout(tid$.current);
    setIsOn(false);
  }, []);

  return { isOn, toggle, start, stop, bpm, setBpm, wave, setWave, beat, pitch, setPitch, volume, setVolume };
}