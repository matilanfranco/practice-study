"use client";

import { useState, useEffect } from "react";
import { AppProvider, useApp }  from "@/context/AppContext";
import { startReminderCheck }   from "@/lib/notifications";
import AuthScreen       from "@/components/auth/AuthScreen";
import OnboardingScreen from "@/components/onboarding/OnboardingScreen";
import DashboardScreen  from "@/components/dashboard/DashboardScreen";
import HistoryScreen    from "@/components/history/HistoryScreen";
import ProfileScreen    from "@/components/profile/ProfileScreen";
import BottomNav        from "@/components/ui/BottomNav";
import SessionSetup     from "@/components/session/SessionSetup";
import SessionScreen    from "@/components/session/SessionScreen";
import BlockLog         from "@/components/session/BlockLog";
import BreakScreen      from "@/components/session/BreakScreen";

const ONBOARDING_KEY = "ps_onboarding_done";

function Inner() {
  const { user, loading, session, startSession, updateSession, endSession, addBlock } = useApp();
  const [view,       setView]       = useState("dashboard");
  const [onboarded,  setOnboarded]  = useState(true); // assume done until checked

  // Check onboarding and start notification checker
  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setOnboarded(false);
    startReminderCheck();
  }, []);

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setOnboarded(true);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      minHeight: "100dvh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg)",
    }}>
      <div className="serif" style={{ fontSize: 28, color: "var(--primary)" }}>
        Practice Studio
      </div>
    </div>
  );

  // ── Not authenticated ────────────────────────────────────────────────────
  if (!user) return <AuthScreen />;

  // ── Onboarding ───────────────────────────────────────────────────────────
  if (!onboarded) return <OnboardingScreen onDone={finishOnboarding} />;

  // ── Session overlay ──────────────────────────────────────────────────────
  if (session) {
    const { phase, blockNum, targetSec, elapsed } = session;

    return (
      <div className="ps-app">
        <div className="overlay">
          {phase === "setup" && (
            <SessionSetup
              blockNum={blockNum}
              onStart={(sec) => updateSession({ phase: "session", targetSec: sec })}
              onCancel={() => {
                if (blockNum === 1) endSession();
                else updateSession({ phase: "break" });
              }}
            />
          )}
          {phase === "session" && (
            <SessionScreen
              blockNum={blockNum}
              targetSec={targetSec}
              onEnd={(el, blockNotes) => updateSession({ phase: "log", elapsed: el, blockNotes })}
            />
          )}
          {phase === "log" && (
            <BlockLog
              elapsed={elapsed}
              blockNum={blockNum}
              notes={session.blockNotes || []}
              onConfirm={(data) => {
                addBlock({ ...data, blockNum });
                updateSession({ phase: "break" });
              }}
            />
          )}
          {phase === "break" && (
            <BreakScreen
              blockNum={blockNum}
              onNext={() =>
                updateSession({ phase: "setup", blockNum: blockNum + 1, targetSec: null, elapsed: 0 })
              }
              onEnd={() => { endSession(); setView("dashboard"); }}
            />
          )}
        </div>
      </div>
    );
  }

  // ── Main app ─────────────────────────────────────────────────────────────
  return (
    <div className="ps-app">
      {view === "dashboard" && <DashboardScreen onStart={startSession} />}
      {view === "history"   && <HistoryScreen />}
      {view === "profile"   && <ProfileScreen />}
      <BottomNav active={view} onNavigate={setView} />
    </div>
  );
}

export default function AppShell() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  );
}