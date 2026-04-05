"use client";

import { useState } from "react";
import { INSTRUMENTS } from "@/lib/constants";
import { useApp } from "@/context/AppContext";

export default function AuthScreen() {
  const { login, register } = useApp();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "", age: "", instrument: "" });
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setErr("");
    if (!form.email || !form.password) { setErr("Complete all fields."); return; }
    if (mode === "register" && (!form.name || !form.age || !form.instrument)) {
      setErr("Complete your profile."); return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
    } catch (e) {
      const msg = {
        "auth/invalid-credential":   "Wrong email or password.",
        "auth/email-already-in-use": "That email is already registered.",
        "auth/weak-password":        "Password must be at least 6 characters.",
        "auth/invalid-email":        "Invalid email address.",
      }[e.code] || "Something went wrong. Try again.";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="ps-app fade-in"
      style={{
        minHeight: "100dvh",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "40px 28px",
      }}
    >
      <div style={{ marginBottom: 48 }}>
        <div style={eyebrow}>Practice Studio</div>
        <h1 className="serif" style={{ fontSize: 46, lineHeight: 1.05, color: "var(--text)", whiteSpace: "pre-line" }}>
          {mode === "login" ? "Welcome\nback." : "Start your\njourney."}
        </h1>
        <p style={{ marginTop: 14, color: "var(--muted)", fontSize: 15 }}>
          {mode === "login" ? "Your practice is waiting." : "A space to grow, one block at a time."}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <input className="input" type="email"    placeholder="Email"    value={form.email}    onChange={set("email")}    autoComplete="email" />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={set("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} />

        {mode === "register" && (
          <>
            <input className="input" placeholder="Your name" value={form.name} onChange={set("name")} />
            <input className="input" type="number" placeholder="Age" value={form.age} onChange={set("age")} />
            <select className="input" value={form.instrument} onChange={set("instrument")}>
              <option value="">Select your instrument</option>
              {INSTRUMENTS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </>
        )}

        {err && <div style={{ color: "var(--danger)", fontSize: 13, textAlign: "center" }}>{err}</div>}

        <button className="btn-primary" style={{ marginTop: 6, opacity: busy ? 0.7 : 1 }} onClick={submit} disabled={busy}>
          {busy ? "..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <button
          className="btn-ghost"
          style={{ textAlign: "center", marginTop: 4 }}
          onClick={() => { setMode((m) => m === "login" ? "register" : "login"); setErr(""); }}
        >
          {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

const eyebrow = {
  fontSize: 11, fontWeight: 600, letterSpacing: "0.14em",
  color: "var(--primary)", textTransform: "uppercase", marginBottom: 14,
};