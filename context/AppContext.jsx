"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  saveUserProfile, getUserProfile,
  addBlock as fbAddBlock, getBlocks as fbGetBlocks,
  deleteBlock as fbDeleteBlock, updateBlock as fbUpdateBlock,
  addExercise as fbAddExercise, getExercises as fbGetExercises,
  updateExercise as fbUpdateExercise, deleteExercise as fbDeleteExercise,
  recordExerciseSession as fbRecordSession,
} from "@/lib/db";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [blocks,    setBlocks]    = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [session,   setSession]   = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const [profile, userBlocks, userExercises] = await Promise.all([
          getUserProfile(firebaseUser.uid),
          fbGetBlocks(firebaseUser.uid),
          fbGetExercises(firebaseUser.uid),
        ]);
        setUser(profile);
        setBlocks(userBlocks);
        setExercises(userExercises);
      } else {
        setUser(null);
        setBlocks([]);
        setExercises([]);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const register = useCallback(async ({ email, password, name, age, instrument }) => {
    const cred    = await createUserWithEmailAndPassword(auth, email, password);
    const profile = { name, age: parseInt(age), instrument, email };
    await saveUserProfile(cred.user.uid, profile);
    setUser({ uid: cred.user.uid, ...profile });
  }, []);

  const login = useCallback(async ({ email, password }) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => { await signOut(auth); }, []);

  const updateUser = useCallback(async (data) => {
    if (!user?.uid) return;
    await saveUserProfile(user.uid, data);
    setUser(u => ({ ...u, ...data }));
  }, [user]);

  // ── Blocks ────────────────────────────────────────────────────────────────
  const addBlock = useCallback(async (blockData) => {
    if (!user?.uid) return;
    const id = await fbAddBlock(user.uid, blockData);
    setBlocks(prev => [{ ...blockData, id, date: new Date().toISOString() }, ...prev]);
  }, [user]);

  const deleteBlock = useCallback(async (blockId) => {
    if (!user?.uid) return;
    await fbDeleteBlock(user.uid, blockId);
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  }, [user]);

  const updateBlock = useCallback(async (blockId, data) => {
    if (!user?.uid) return;
    await fbUpdateBlock(user.uid, blockId, data);
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, ...data } : b));
  }, [user]);

  // ── Exercises ─────────────────────────────────────────────────────────────
  const addExercise = useCallback(async (data) => {
    if (!user?.uid) return;
    const id = await fbAddExercise(user.uid, data);
    const newEx = { ...data, id, timesPlayed: 0, lastBpm: null, lastRating: null, avgBpm: null, avgRating: null };
    setExercises(prev => [...prev, newEx]);
    return id;
  }, [user]);

  const updateExercise = useCallback(async (exerciseId, data) => {
    if (!user?.uid) return;
    await fbUpdateExercise(user.uid, exerciseId, data);
    setExercises(prev => prev.map(e => e.id === exerciseId ? { ...e, ...data } : e));
  }, [user]);

  const deleteExercise = useCallback(async (exerciseId) => {
    if (!user?.uid) return;
    await fbDeleteExercise(user.uid, exerciseId);
    setExercises(prev => prev.filter(e => e.id !== exerciseId));
  }, [user]);

  const recordExerciseSession = useCallback(async (exerciseId, stats) => {
    if (!user?.uid) return;
    await fbRecordSession(user.uid, exerciseId, stats);
    // Refresh exercise data
    const updated = await fbGetExercises(user.uid);
    setExercises(updated);
  }, [user]);

  // ── Session flow ──────────────────────────────────────────────────────────
  const startSession  = useCallback(() =>
    setSession({ phase: "setup", blockNum: 1, targetSec: null, elapsed: 0 }), []);
  const updateSession = useCallback((patch) =>
    setSession(s => ({ ...s, ...patch })), []);
  const endSession    = useCallback(() => setSession(null), []);

  return (
    <AppContext.Provider value={{
      user, loading,
      register, login, logout, updateUser,
      blocks, addBlock, deleteBlock, updateBlock,
      exercises, addExercise, updateExercise, deleteExercise, recordExerciseSession,
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