"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  saveUserProfile, getUserProfile,
  addBlock as fbAddBlock, getBlocks as fbGetBlocks,
  deleteBlock as fbDeleteBlock, updateBlock as fbUpdateBlock,
} from "@/lib/db";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [blocks,  setBlocks]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // ── Auth state listener ───────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile);
        const userBlocks = await fbGetBlocks(firebaseUser.uid);
        setBlocks(userBlocks);
      } else {
        setUser(null);
        setBlocks([]);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Auth actions ──────────────────────────────────────────────────────────
  const register = useCallback(async ({ email, password, name, age, instrument }) => {
    const cred    = await createUserWithEmailAndPassword(auth, email, password);
    const profile = { name, age: parseInt(age), instrument, email };
    await saveUserProfile(cred.user.uid, profile);
    setUser({ uid: cred.user.uid, ...profile });
  }, []);

  const login = useCallback(async ({ email, password }) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const updateUser = useCallback(async (data) => {
    if (!user?.uid) return;
    await saveUserProfile(user.uid, data);
    setUser((u) => ({ ...u, ...data }));
  }, [user]);

  // ── Blocks ────────────────────────────────────────────────────────────────
  const addBlock = useCallback(async (blockData) => {
    if (!user?.uid) return;
    const id = await fbAddBlock(user.uid, blockData);
    const newBlock = { ...blockData, id, date: new Date().toISOString() };
    setBlocks((prev) => [newBlock, ...prev]);
  }, [user]);

  const deleteBlock = useCallback(async (blockId) => {
    if (!user?.uid) return;
    await fbDeleteBlock(user.uid, blockId);
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  }, [user]);

  const updateBlock = useCallback(async (blockId, data) => {
    if (!user?.uid) return;
    await fbUpdateBlock(user.uid, blockId, data);
    setBlocks((prev) => prev.map((b) => b.id === blockId ? { ...b, ...data } : b));
  }, [user]);

  // ── Session flow ──────────────────────────────────────────────────────────
  const startSession  = useCallback(() =>
    setSession({ phase: "setup", blockNum: 1, targetSec: null, elapsed: 0 }), []);

  const updateSession = useCallback((patch) =>
    setSession((s) => ({ ...s, ...patch })), []);

  const endSession = useCallback(() =>
    setSession(null), []);

  return (
    <AppContext.Provider value={{
      user, loading,
      register, login, logout, updateUser,
      blocks, addBlock, deleteBlock, updateBlock,
      session, startSession, updateSession, endSession,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};