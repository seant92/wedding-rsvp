import { getVenues, getWeddingData } from "@/lib/db";
import RSVPClient from "./RSVPClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const wedding = await getWeddingData();
  const ogImage = wedding?.cardImageUrl ?? "/og-image.jpg";
  return {
    openGraph: {
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Christine & Edward Wedding Invitation" }],
    },
  };
}

export default async function RSVPPage() {
  const [venues, wedding] = await Promise.all([getVenues(), getWeddingData()]);
  return <RSVPClient initialVenues={venues} initialWeddingData={wedding} />;
}
