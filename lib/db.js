import {
  doc, setDoc, getDoc,
  collection, addDoc, getDocs, deleteDoc, updateDoc,
  query, orderBy, serverTimestamp,
  enableIndexedDbPersistence,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── Offline persistence ───────────────────────────────────────────────────
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code !== "failed-precondition" && err.code !== "unimplemented") {
      console.warn("Firestore persistence error:", err);
    }
  });
}

// ─── USER PROFILE ──────────────────────────────────────────────────────────
export const saveUserProfile = async (uid, data) => {
  await setDoc(doc(db, "users", uid), data, { merge: true });
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
};

// ─── BLOCKS ────────────────────────────────────────────────────────────────
export const addBlock = async (uid, blockData) => {
  const ref = await addDoc(
    collection(db, "users", uid, "blocks"),
    { ...blockData, date: serverTimestamp() }
  );
  return ref.id;
};

export const getBlocks = async (uid) => {
  const q    = query(collection(db, "users", uid, "blocks"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id:   d.id,
    ...d.data(),
    date: d.data().date?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  }));
};

export const deleteBlock = async (uid, blockId) => {
  await deleteDoc(doc(db, "users", uid, "blocks", blockId));
};

export const updateBlock = async (uid, blockId, data) => {
  await updateDoc(doc(db, "users", uid, "blocks", blockId), data);
};

// ─── EXERCISES ─────────────────────────────────────────────────────────────
export const addExercise = async (uid, data) => {
  const ref = await addDoc(
    collection(db, "users", uid, "exercises"),
    { ...data, createdAt: serverTimestamp(), lastPracticed: null, lastBpm: null, lastRating: null, avgBpm: null, avgRating: null, timesPlayed: 0 }
  );
  return ref.id;
};

export const getExercises = async (uid) => {
  const q    = query(collection(db, "users", uid, "exercises"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateExercise = async (uid, exerciseId, data) => {
  await updateDoc(doc(db, "users", uid, "exercises", exerciseId), data);
};

export const deleteExercise = async (uid, exerciseId) => {
  await deleteDoc(doc(db, "users", uid, "exercises", exerciseId));
};

// Update exercise stats after a block
export const recordExerciseSession = async (uid, exerciseId, { bpm, rating }) => {
  const snap = await getDoc(doc(db, "users", uid, "exercises", exerciseId));
  if (!snap.exists()) return;
  const ex      = snap.data();
  const times   = (ex.timesPlayed || 0) + 1;
  const avgBpm  = bpm    ? Math.round(((ex.avgBpm    || bpm)    * (times - 1) + bpm)    / times) : ex.avgBpm;
  const avgRat  = rating ? ((ex.avgRating || rating) * (times - 1) + rating) / times             : ex.avgRating;
  await updateDoc(doc(db, "users", uid, "exercises", exerciseId), {
    lastBpm:       bpm    || ex.lastBpm,
    lastRating:    rating || ex.lastRating,
    lastPracticed: serverTimestamp(),
    avgBpm,
    avgRating:     avgRat ? parseFloat(avgRat.toFixed(2)) : null,
    timesPlayed:   times,
  });
};