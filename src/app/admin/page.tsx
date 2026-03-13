"use client";

import { useState, useEffect, useRef } from "react";
import { subscribeToGuests, getWeddingData, updateWeddingData, getVenues } from "@/lib/db";
import { uploadCardFile } from "@/lib/storage";
import { Guest, WeddingData, Venue } from "@/types";
import Link from "next/link";
import dynamic from "next/dynamic";

const QRCodeCard = dynamic(() => import("@/components/QRCodeCard"), { ssr: false });

function StatCard({
  value,
  label,
  color,
  accent,
}: {
  value: number;
  label: string;
  color: string;
  accent: string;
}) {
  return (
    <div className="card-elegant p-5 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
        style={{ background: accent }}
      />
      <div className="pl-3">
        <div className="text-3xl font-serif font-bold" style={{ color }}>
          {value}
        </div>
        <div className="text-xs font-sans text-stone mt-0.5 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSiteUrl(window.location.origin);
    const unsubGuests = subscribeToGuests(setGuests);
    const fetchData = async () => {
      const [wedding, venuesData] = await Promise.all([getWeddingData(), getVenues()]);
      setWeddingData(wedding);
      setVenues(venuesData);
    };
    fetchData();
    return () => unsubGuests();
  }, []);

  const stats = {
    total: guests.length,
    yes: guests.filter((g) => g.status === "yes").length,
    no: guests.filter((g) => g.status === "no").length,
    maybe: guests.filter((g) => g.status === "maybe").length,
    plusOnes: guests.filter((g) => g.plusOne.attending).length,
    totalAttending:
      guests.filter((g) => g.status === "yes").length +
      guests.filter((g) => g.plusOne.attending && g.status === "yes").length,
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    try {
      const isPdf = file.type === "application/pdf";
      const type = isPdf ? "pdf" : "image";
      const url = await uploadCardFile(file, type);
      if (isPdf) {
        await updateWeddingData({ cardPdfUrl: url, cardImageUrl: null });
        setWeddingData((prev) => (prev ? { ...prev, cardPdfUrl: url, cardImageUrl: null } : null));
      } else {
        await updateWeddingData({ cardImageUrl: url, cardPdfUrl: null });
        setWeddingData((prev) => (prev ? { ...prev, cardImageUrl: url, cardPdfUrl: null } : null));
      }
      setUploadMsg("Card uploaded successfully!");
    } catch {
      setUploadMsg("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setUploadMsg(""), 3000);
    }
  };

  const filteredGuests = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.phone.includes(searchTerm)
  );

  const attendingPercent = stats.total > 0 ? Math.round((stats.yes / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="ornament">✦</span>
            <h1 className="text-2xl font-serif text-charcoal">Dashboard</h1>
          </div>
          <p className="text-sm font-sans text-stone">Christine & Edward — Wedding Overview</p>
        </div>
        <Link
          href="/admin/guests"
          className="text-sm font-sans font-semibold flex items-center gap-1.5 transition"
          style={{ color: "var(--gold-dark)" }}
        >
          View All Guests
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard value={stats.total} label="Total RSVPs" color="var(--charcoal)" accent="var(--gold)" />
        <StatCard value={stats.yes} label="Attending" color="#16a34a" accent="#4ade80" />
        <StatCard value={stats.no} label="Declined" color="#dc2626" accent="#f87171" />
        <StatCard value={stats.maybe} label="Maybe" color="#ca8a04" accent="#fbbf24" />
        <StatCard value={stats.plusOnes} label="Plus Ones" color="var(--gold-dark)" accent="var(--gold)" />
        <StatCard value={stats.totalAttending} label="Total Heads" color="var(--burgundy)" accent="var(--burgundy)" />
      </div>

      {/* Attendance progress bar */}
      {stats.total > 0 && (
        <div className="card-elegant p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-sans font-semibold text-charcoal">Attendance Overview</span>
            <span className="text-sm font-sans text-stone">{attendingPercent}% confirmed</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-stone-100">
            <div className="h-full flex">
              {stats.yes > 0 && (
                <div
                  className="h-full"
                  style={{ width: `${(stats.yes / stats.total) * 100}%`, background: "linear-gradient(90deg,#16a34a,#4ade80)" }}
                />
              )}
              {stats.maybe > 0 && (
                <div
                  className="h-full"
                  style={{ width: `${(stats.maybe / stats.total) * 100}%`, background: "linear-gradient(90deg,#ca8a04,#fbbf24)" }}
                />
              )}
              {stats.no > 0 && (
                <div
                  className="h-full"
                  style={{ width: `${(stats.no / stats.total) * 100}%`, background: "linear-gradient(90deg,#dc2626,#f87171)" }}
                />
              )}
            </div>
          </div>
          <div className="flex gap-5 mt-2.5 text-xs font-sans text-stone">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Attending ({stats.yes})</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Maybe ({stats.maybe})</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Declined ({stats.no})</span>
          </div>
        </div>
      )}

      {/* QR Code + Card Upload */}
      <div className="grid md:grid-cols-2 gap-6">
        {siteUrl && <QRCodeCard url={siteUrl} />}

        <div className="card-elegant p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-lg text-charcoal">Wedding Card</h2>
              <p className="text-xs font-sans text-stone mt-0.5">Upload your Canva design</p>
            </div>
            <span className="ornament text-lg">✦</span>
          </div>

          <label
            className="relative flex flex-col items-center justify-center w-full h-28 rounded-xl cursor-pointer transition-all hover:opacity-90"
            style={{ border: "2px dashed var(--gold-light)", background: "var(--champagne)" }}
          >
            {uploading ? (
              <div className="flex items-center gap-2 text-stone text-sm font-sans">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Uploading...
              </div>
            ) : (
              <>
                <svg className="w-6 h-6 mb-2" style={{ color: "var(--gold)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm font-sans text-stone">Click to upload PDF or image</span>
                <span className="text-xs font-sans text-stone-400 mt-0.5">Invitation card for guests to view</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>

          {uploadMsg && (
            <p className={`text-sm font-sans mt-3 text-center ${uploadMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
              {uploadMsg}
            </p>
          )}

          {weddingData?.cardImageUrl && (
            <div className="mt-4 rounded-xl overflow-hidden" style={{ border: "1px solid var(--gold-light)" }}>
              <img src={weddingData.cardImageUrl} alt="Wedding Card" className="w-full h-24 object-cover" />
            </div>
          )}
          {weddingData?.cardPdfUrl && (
            <a
              href={weddingData.cardPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-sans font-semibold"
              style={{ color: "var(--gold-dark)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View PDF Card
            </a>
          )}
        </div>
      </div>

      {/* Venues Preview */}
      <div className="card-elegant p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg text-charcoal">Venues</h2>
            <span
              className="text-xs font-sans px-2 py-0.5 rounded-full"
              style={{ background: "var(--champagne)", color: "var(--stone)", border: "1px solid var(--gold-light)" }}
            >
              {venues.length}
            </span>
          </div>
          <Link href="/admin/venues" className="text-xs font-sans font-semibold" style={{ color: "var(--gold-dark)" }}>
            Manage →
          </Link>
        </div>
        {venues.length === 0 ? (
          <p className="text-stone font-sans text-sm text-center py-4">No venues yet. <Link href="/admin/venues" className="font-semibold" style={{ color: "var(--gold-dark)" }}>Add one →</Link></p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {venues.slice(0, 3).map((venue) => (
              <div
                key={venue.id}
                className="rounded-xl p-4 border-l-4"
                style={{ background: "var(--champagne)", borderLeftColor: "var(--gold)" }}
              >
                <h3 className="font-serif text-charcoal font-medium">{venue.name}</h3>
                <p className="text-xs font-sans text-stone mt-1 leading-relaxed">{venue.address}</p>
                {venue.date && <p className="text-xs font-sans text-stone mt-1">📅 {venue.date}</p>}
                {venue.time && <p className="text-xs font-sans text-stone">🕐 {venue.time}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent RSVPs */}
      <div className="card-elegant p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg text-charcoal">Recent RSVPs</h2>
            {guests.length > 0 && (
              <span
                className="text-xs font-sans px-2 py-0.5 rounded-full animate-pulse"
                style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.2)" }}
              >
                ● Live
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="Search name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-elegant w-full sm:w-56 text-sm py-2"
          />
        </div>

        {filteredGuests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-stone font-sans text-sm">
              {guests.length === 0 ? "No RSVPs yet — share the link with guests!" : "No results found."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "2px solid var(--champagne)" }}>
                  {["Name", "Phone", "Status", "+1", "Date"].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-sans font-semibold text-stone uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredGuests.slice(0, 10).map((guest) => (
                  <tr
                    key={guest.id}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid rgba(245,236,215,0.8)" }}
                  >
                    <td className="py-3 px-3 font-sans font-medium text-charcoal">{guest.name}</td>
                    <td className="py-3 px-3 font-sans text-stone">{guest.phone}</td>
                    <td className="py-3 px-3">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-sans font-semibold"
                        style={{
                          background: guest.status === "yes" ? "rgba(22,163,74,0.1)" : guest.status === "no" ? "rgba(220,38,38,0.1)" : "rgba(202,138,4,0.1)",
                          color: guest.status === "yes" ? "#16a34a" : guest.status === "no" ? "#dc2626" : "#ca8a04",
                        }}
                      >
                        {guest.status === "yes" ? "Attending" : guest.status === "no" ? "Declined" : "Maybe"}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-xs">
                      {guest.plusOne.attending ? (
                        <span style={{ color: "var(--gold-dark)" }}>✓ {guest.plusOne.name || "Yes"}</span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-sans text-xs text-stone">
                      {new Date(guest.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredGuests.length > 10 && (
          <div className="mt-4 text-center">
            <Link href="/admin/guests" className="text-sm font-sans font-semibold" style={{ color: "var(--gold-dark)" }}>
              View all {filteredGuests.length} RSVPs →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
