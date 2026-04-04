"use client";

import { useState } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import AuthScreen       from "@/components/auth/AuthScreen";
import DashboardScreen  from "@/components/dashboard/DashboardScreen";
import HistoryScreen    from "@/components/history/HistoryScreen";
import ProfileScreen    from "@/components/profile/ProfileScreen";
import BottomNav        from "@/components/ui/BottomNav";
import SessionSetup     from "@/components/session/SessionSetup";
import SessionScreen    from "@/components/session/SessionScreen";
import BlockLog         from "@/components/session/BlockLog";
import BreakScreen      from "@/components/session/BreakScreen";

function Inner() {
  const { user, loading, session, startSession, updateSession, endSession, addBlock } = useApp();
  const [view, setView] = useState("dashboard");

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
    }}>
      <div className="serif" style={{ fontSize: 28, color: "var(--primary)" }}>
        Practice Studio
      </div>
    </div>
  );

  // ── Not authenticated ────────────────────────────────────────────────────
  if (!user) return <AuthScreen />;

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
              onEnd={(el) => updateSession({ phase: "log", elapsed: el })}
            />
          )}

          {phase === "log" && (
            <BlockLog
              elapsed={elapsed}
              blockNum={blockNum}
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
                updateSession({
                  phase: "setup",
                  blockNum: blockNum + 1,
                  targetSec: null,
                  elapsed: 0,
                })
              }
              onEnd={() => {
                endSession();
                setView("dashboard");
              }}
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