"use client";

import { useState, useEffect, useRef } from "react";
import { subscribeToGuests, getWeddingData, updateWeddingData, getVenues } from "@/lib/db";
import { uploadCardFile } from "@/lib/storage";
import { Guest, WeddingData, Venue } from "@/types";
import Link from "next/link";

export default function AdminDashboard() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubGuests = subscribeToGuests(setGuests);
    const fetchData = async () => {
      const [wedding, venuesData] = await Promise.all([
        getWeddingData(),
        getVenues(),
      ]);
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
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const isPdf = file.type === "application/pdf";
      const type = isPdf ? "pdf" : "image";
      const url = await uploadCardFile(file, type);

      if (isPdf) {
        await updateWeddingData({ cardPdfUrl: url, cardImageUrl: null });
      } else {
        await updateWeddingData({ cardImageUrl: url, cardPdfUrl: null });
      }

      setWeddingData((prev) => (prev ? { ...prev, [isPdf ? "cardPdfUrl" : "cardImageUrl"]: url } : null));
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const filteredGuests = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-stone-800">Dashboard</h1>
        <Link
          href="/admin/guests"
          className="text-[#b91c1c] hover:text-[#991b1b] font-medium"
        >
          View All Guests →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-stone-800">{stats.total}</div>
          <div className="text-sm text-stone-600">Total RSVPs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.yes}</div>
          <div className="text-sm text-stone-600">Attending</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-red-600">{stats.no}</div>
          <div className="text-sm text-stone-600">Not Attending</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600">{stats.maybe}</div>
          <div className="text-sm text-stone-600">Maybe</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-[#b91c1c]">{stats.plusOnes}</div>
          <div className="text-sm text-stone-600">Plus Ones</div>
        </div>
      </div>

      {/* Card Upload */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-stone-800 mb-4">Wedding Card</h2>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#b91c1c] file:text-white hover:file:bg-[#991b1b] cursor-pointer"
            />
            <p className="text-sm text-stone-500 mt-2">
              Upload your Canva design (PDF or image)
            </p>
          </div>
          {weddingData?.cardImageUrl && (
            <div className="w-48 h-32 bg-stone-100 rounded overflow-hidden">
              <img
                src={weddingData.cardImageUrl}
                alt="Wedding Card"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {weddingData?.cardPdfUrl && (
            <a
              href={weddingData.cardPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#b91c1c] hover:text-[#991b1b]"
            >
              View PDF Card
            </a>
          )}
        </div>
      </div>

      {/* Venues Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-800">Venues</h2>
          <Link
            href="/admin/venues"
            className="text-sm text-[#b91c1c] hover:text-[#991b1b]"
          >
            Manage →
          </Link>
        </div>
        {venues.length === 0 ? (
          <p className="text-stone-500">No venues added yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {venues.slice(0, 3).map((venue) => (
              <div key={venue.id} className="border border-stone-200 rounded p-4">
                <h3 className="font-medium text-stone-800">{venue.name}</h3>
                <p className="text-sm text-stone-600">{venue.address}</p>
                {venue.date && <p className="text-sm text-stone-500">{venue.date}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Guests */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-800">Recent RSVPs</h2>
        </div>
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-[#b91c1c] focus:border-[#b91c1c] outline-none mb-4"
        />
        {filteredGuests.length === 0 ? (
          <p className="text-stone-500">No RSVPs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-3 px-2 font-medium text-stone-600">Name</th>
                  <th className="text-left py-3 px-2 font-medium text-stone-600">Phone</th>
                  <th className="text-left py-3 px-2 font-medium text-stone-600">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-stone-600">Plus One</th>
                  <th className="text-left py-3 px-2 font-medium text-stone-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.slice(0, 10).map((guest) => (
                  <tr key={guest.id} className="border-b border-stone-100">
                    <td className="py-3 px-2">{guest.name}</td>
                    <td className="py-3 px-2">{guest.phone}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          guest.status === "yes"
                            ? "bg-green-100 text-green-800"
                            : guest.status === "no"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {guest.status}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {guest.plusOne.attending ? guest.plusOne.name || "Yes" : "-"}
                    </td>
                    <td className="py-3 px-2 text-stone-500">
                      {new Date(guest.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
