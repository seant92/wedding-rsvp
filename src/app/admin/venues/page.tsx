"use client";

import { useState, useEffect } from "react";
import { subscribeToVenues, addVenue, updateVenue, deleteVenue } from "@/lib/db";
import { Venue } from "@/types";

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    mapEmbedUrl: "",
    date: "",
    time: "",
    order: 0,
  });

  useEffect(() => {
    const unsub = subscribeToVenues(setVenues);
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      await updateVenue(editingId, formData);
    } else {
      await addVenue({ ...formData, order: venues.length });
    }
    resetForm();
  };

  const handleEdit = (venue: Venue) => {
    setFormData({
      name: venue.name,
      address: venue.address,
      mapEmbedUrl: venue.mapEmbedUrl,
      date: venue.date,
      time: venue.time,
      order: venue.order,
    });
    setEditingId(venue.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this venue?")) {
      await deleteVenue(id);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", address: "", mapEmbedUrl: "", date: "", time: "", order: 0 });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-stone-800">Venues</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#b91c1c] text-white px-4 py-2 rounded-md hover:bg-[#991b1b] transition"
        >
          + Add Venue
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            {editingId ? "Edit Venue" : "Add New Venue"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Venue Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-[#b91c1c] focus:border-[#b91c1c] outline-none"
                  placeholder="e.g., Church, Reception, Evening Party"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-[#b91c1c] focus:border-[#b91c1c] outline-none"
                  placeholder="e.g., Saturday, June 15th 2026"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-[#b91c1c] focus:border-[#b91c1c] outline-none"
                placeholder="Full address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Google Maps Embed URL
              </label>
              <input
                type="text"
                value={formData.mapEmbedUrl}
                onChange={(e) => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
                className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-[#b91c1c] focus:border-[#b91c1c] outline-none"
                placeholder="https://www.google.com/maps/embed?..."
              />
              <p className="text-xs text-stone-500 mt-1">
                Go to Google Maps → Search venue → Share → Embed a map → Copy the src URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Time
              </label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-[#b91c1c] focus:border-[#b91c1c] outline-none"
                placeholder="e.g., 2:00 PM"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-[#b91c1c] text-white px-6 py-2 rounded-md hover:bg-[#991b1b] transition"
              >
                {editingId ? "Update" : "Add"} Venue
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-stone-300 rounded-md hover:bg-stone-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {venues.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-stone-500">No venues added yet. Click "Add Venue" to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <div key={venue.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-2">{venue.name}</h3>
                <p className="text-stone-600 text-sm mb-2">{venue.address || "No address"}</p>
                {venue.date && <p className="text-stone-600 text-sm mb-1">📅 {venue.date}</p>}
                {venue.time && <p className="text-stone-600 text-sm">🕐 {venue.time}</p>}
              </div>
              {venue.mapEmbedUrl && (
                <div className="h-40 bg-stone-100">
                  <iframe
                    src={venue.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={venue.name}
                  ></iframe>
                </div>
              )}
              <div className="p-4 border-t border-stone-200 flex gap-2">
                <button
                  onClick={() => handleEdit(venue)}
                  className="text-sm text-[#b91c1c] hover:text-[#991b1b]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(venue.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
