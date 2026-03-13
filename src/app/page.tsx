import { getVenues, getWeddingData, addGuest } from "@/lib/db";
import { Venue, WeddingData, Guest } from "@/types";
import RSVPClient from "./RSVPClient";

export const dynamic = 'force-dynamic';

async function getData() {
  const [venues, wedding] = await Promise.all([
    getVenues(),
    getWeddingData(),
  ]);
  return { venues, wedding };
}

export default async function RSVPPage() {
  const { venues, wedding } = await getData();
  return <RSVPClient initialVenues={venues} initialWeddingData={wedding} />;
}
