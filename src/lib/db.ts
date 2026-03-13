import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { Venue, Guest, WeddingData } from "../types";

const WEDDING_ID = "wedding-1";

export async function getWeddingData(): Promise<WeddingData | null> {
  const docRef = doc(db, "weddings", WEDDING_ID);
  const snapshot = await getDocs(collection(db, "weddings"));
  if (snapshot.empty) {
    return null;
  }
  return snapshot.docs[0].data() as WeddingData;
}

export async function updateWeddingData(data: Partial<WeddingData>): Promise<void> {
  const snapshot = await getDocs(collection(db, "weddings"));
  if (snapshot.empty) {
    await addDoc(collection(db, "weddings"), {
      ...data,
      createdAt: Date.now(),
    });
  } else {
    const docRef = doc(db, "weddings", snapshot.docs[0].id);
    await updateDoc(docRef, data);
  }
}

export async function getVenues(): Promise<Venue[]> {
  const q = query(collection(db, "venues"), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Venue[];
}

export function subscribeToVenues(callback: (venues: Venue[]) => void) {
  const q = query(collection(db, "venues"), orderBy("order", "asc"));
  return onSnapshot(q, (snapshot) => {
    const venues = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Venue[];
    callback(venues);
  });
}

export async function addVenue(venue: Omit<Venue, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, "venues"), venue);
  return docRef.id;
}

export async function updateVenue(id: string, data: Partial<Venue>): Promise<void> {
  const docRef = doc(db, "venues", id);
  await updateDoc(docRef, data);
}

export async function deleteVenue(id: string): Promise<void> {
  const docRef = doc(db, "venues", id);
  await deleteDoc(docRef);
}

export async function getGuests(): Promise<Guest[]> {
  const q = query(collection(db, "guests"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Guest[];
}

export function subscribeToGuests(callback: (guests: Guest[]) => void) {
  const q = query(collection(db, "guests"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const guests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Guest[];
    callback(guests);
  });
}

export async function addGuest(guest: Omit<Guest, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, "guests"), {
    ...guest,
    createdAt: Date.now(),
  });
  return docRef.id;
}

export async function updateGuest(id: string, data: Partial<Guest>): Promise<void> {
  const docRef = doc(db, "guests", id);
  await updateDoc(docRef, data);
}

export async function deleteGuest(id: string): Promise<void> {
  const docRef = doc(db, "guests", id);
  await deleteDoc(docRef);
}
