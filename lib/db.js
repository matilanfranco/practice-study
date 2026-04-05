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
    if (err.code === "failed-precondition") {
      console.warn("Firestore persistence unavailable: multiple tabs open");
    } else if (err.code === "unimplemented") {
      console.warn("Firestore persistence not supported in this browser");
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