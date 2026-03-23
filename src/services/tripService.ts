import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";

export async function createTrip(uid: string, tripData: any) {
  const tripsRef = collection(db, "trips");
  const docRef = await addDoc(tripsRef, {
    ...tripData,
    uid,
    mediaUrls: [],
    locations: [],
    likeCount: 0,
    viewCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "users", uid), { tripCount: increment(1) });
  return docRef.id;
}

export async function getTrip(tripId: string) {
  const snap = await getDoc(doc(db, "trips", tripId));
  if (!snap.exists()) throw new Error("여행 기록을 찾을 수 없습니다");
  await updateDoc(doc(db, "trips", tripId), { viewCount: increment(1) });
  return { id: snap.id, ...snap.data() };
}

export async function getMyTrips(uid: string, limitCount = 20) {
  const q = query(
    collection(db, "trips"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPublicFeed(limitCount = 30) {
  const q = query(
    collection(db, "trips"),
    where("isPublic", "==", true),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateTrip(tripId: string, updates: any) {
  await updateDoc(doc(db, "trips", tripId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTrip(tripId: string, uid: string) {
  await deleteDoc(doc(db, "trips", tripId));
  await updateDoc(doc(db, "users", uid), { tripCount: increment(-1) });
}

export async function addLocation(tripId: string, location: any) {
  const snap = await getDoc(doc(db, "trips", tripId));
  const current = (snap.data()?.locations) || [];
  await updateDoc(doc(db, "trips", tripId), {
    locations: [...current, location],
    updatedAt: serverTimestamp(),
  });
}

export async function searchByTag(tag: string, limitCount = 20) {
  const q = query(
    collection(db, "trips"),
    where("isPublic", "==", true),
    where("tags", "array-contains", tag),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}