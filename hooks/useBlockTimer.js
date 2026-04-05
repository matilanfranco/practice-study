"use client";

import { useState, useRef, useEffect } from "react";
import { playBlockAlarm } from "@/lib/sounds";

export function useBlockTimer() {
  const [elapsed,  setElapsed]  = useState(0);
  const [target,   setTargetS]  = useState(25 * 60);
  const [running,  setRunning]  = useState(false);
  const [overtime, setOvertime] = useState(false);

  const tgt$      = useRef(25 * 60);
  const run$      = useRef(false);
  const int$      = useRef(null);
  const startTs$  = useRef(null); // timestamp when started
  const baseElap$ = useRef(0);    // elapsed before last start
  const fired$    = useRef(new Set());

  const setTarget = (v) => {
    tgt$.current = v;
    setTargetS(v);
    fired$.current.clear();
  };

  const startInterval = () => {
    clearInterval(int$.current);
    int$.current = setInterval(() => {
      if (!run$.current || !startTs$.current) return;
      const now     = Date.now();
      const elapsed = baseElap$.current + Math.floor((now - startTs$.current) / 1000);
      setElapsed(elapsed);
      if (elapsed >= tgt$.current) {
        const over = elapsed - tgt$.current;
        setOvertime(true);
        if (!fired$.current.has(Math.floor(over / 60)) && over % 60 === 0) {
          fired$.current.add(Math.floor(over / 60));
          playBlockAlarm();
        }
      }
    }, 500); // check every 500ms for accuracy
  };

  const start = () => {
    if (run$.current) return;
    run$.current   = true;
    startTs$.current = Date.now();
    setRunning(true);
    startInterval();
  };

  const pause = () => {
    if (!run$.current) return;
    // save elapsed before pausing
    baseElap$.current = baseElap$.current + Math.floor((Date.now() - startTs$.current) / 1000);
    startTs$.current  = null;
    run$.current      = false;
    setRunning(false);
    clearInterval(int$.current);
  };

  const resume = () => {
    if (run$.current) return;
    startTs$.current = Date.now();
    run$.current     = true;
    setRunning(true);
    startInterval();
  };

  const reset = () => {
    pause();
    setElapsed(0);
    baseElap$.current = 0;
    startTs$.current  = null;
    setOvertime(false);
    fired$.current.clear();
  };

  useEffect(() => () => {
    clearInterval(int$.current);
    run$.current = false;
  }, []);

  const progress = tgt$.current > 0 ? Math.min(1, elapsed / tgt$.current) : 0;

  return {
    elapsed, target, setTarget,
    running, overtime,
    start, pause, resume, reset,
    progress,
  };
}