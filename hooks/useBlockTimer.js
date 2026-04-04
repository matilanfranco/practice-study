"use client";

import { useState, useRef, useEffect } from "react";
import { playBlockAlarm } from "@/lib/sounds";

export function useBlockTimer() {
  const [elapsed,  setElapsed]  = useState(0);
  const [target,   setTargetS]  = useState(25 * 60);
  const [running,  setRunning]  = useState(false);
  const [overtime, setOvertime] = useState(false);

  const tgt$   = useRef(25 * 60);
  const run$   = useRef(false);
  const int$   = useRef(null);
  const fired$ = useRef(new Set());

  const setTarget = (v) => {
    tgt$.current = v;
    setTargetS(v);
    fired$.current.clear();
  };

  const startInterval = () => {
    clearInterval(int$.current);
    int$.current = setInterval(() => {
      setElapsed((e) => {
        const n = e + 1;
        if (n >= tgt$.current) {
          const over = n - tgt$.current;
          setOvertime(true);
          if (!fired$.current.has(over) && (over === 0 || over % 60 === 0)) {
            fired$.current.add(over);
            playBlockAlarm();
          }
        }
        return n;
      });
    }, 1000);
  };

  const start = () => {
    if (run$.current) return;
    run$.current = true;
    setRunning(true);
    startInterval();
  };

  const pause = () => {
    run$.current = false;
    setRunning(false);
    clearInterval(int$.current);
  };

  const resume = () => {
    if (run$.current) return;
    run$.current = true;
    setRunning(true);
    startInterval();
  };

  const reset = () => {
    pause();
    setElapsed(0);
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
