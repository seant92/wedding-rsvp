"use client";

import { useState, useEffect } from "react";
import { getVenues, getWeddingData, addGuest } from "@/lib/db";
import { Venue, WeddingData, Guest } from "@/types";

export default function RSVPPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    status: "" as "yes" | "no" | "maybe" | "",
    plusOneAttending: false,
    plusOneName: "",
    dietaryRequirements: "",
    message: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const [venuesData, wedding] = await Promise.all([
        getVenues(),
        getWeddingData(),
      ]);
      setVenues(venuesData);
      setWeddingData(wedding);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.status) return;

    setSubmitting(true);
    try {
      const guestData: Omit<Guest, "id" | "createdAt"> = {
        name: formData.name,
        phone: formData.phone,
        status: formData.status as "yes" | "no" | "maybe",
        plusOne: {
          attending: formData.plusOneAttending,
          name: formData.plusOneName,
        },
        dietaryRequirements: formData.dietaryRequirements,
        message: formData.message,
      };
      await addGuest(guestData);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting RSVP:", error);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#b91c1c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7] p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif text-stone-800 mb-2">Thank You!</h1>
          <p className="text-stone-600 mb-4">
            Your RSVP has been submitted successfully.
          </p>
          <p className="text-sm text-stone-500">
            We look forward to celebrating with you!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="bg-white shadow-sm border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl md:text-4xl font-serif text-stone-800">
            Wedding RSVP
          </h1>
        </div>
      </header>

      {weddingData?.cardImageUrl && (
        <section className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={weddingData.cardImageUrl}
              alt="Wedding Invitation"
              className="w-full h-auto"
            />
          </div>
        </section>
      )}

      {weddingData?.cardPdfUrl && (
        <section className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <a
              href={weddingData.cardPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#b91c1c] hover:text-[#991b1b] font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Invitation Card (PDF)
            </a>
          </div>
        </section>
      )}

      {venues.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-serif text-stone-800 text-center mb-6">
            Wedding Details
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-stone-800 mb-2">
                    {venue.name}
                  </h3>
                  <p className="text-stone-600 text-sm mb-2">{venue.address}</p>
                  {venue.date && (
                    <p className="text-stone-600 text-sm mb-2">
                      📅 {venue.date}
                    </p>
                  )}
                  {venue.time && (
                    <p className="text-stone-600 text-sm mb-4">
                      🕐 {venue.time}
                    </p>
                  )}
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
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-2xl mx-auto px-4 py-8 pb-16">
        <h2 className="text-2xl font-serif text-stone-800 text-center mb-6">
          RSVP
        </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6 md:p-8"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-[#b91c1c] focus:border-[#b91c1c] outline-none transition"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-[#b91c1c] focus:border-[#b91c1c] outline-none transition"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Will you attend? *
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { value: "yes", label: "Yes, I'll be there!" },
                  { value: "no", label: "No, I can't make it" },
                  { value: "maybe", label: "Maybe" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={formData.status === option.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as "yes" | "no" | "maybe",
                        })
                      }
                      className="w-4 h-4 text-[#b91c1c] focus:ring-[#b91c1c]"
                    />
                    <span className="text-sm text-stone-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.status === "yes" && (
              <div className="border-t border-stone-200 pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.plusOneAttending}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        plusOneAttending: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#b91c1c] focus:ring-[#b91c1c] rounded"
                  />
                  <span className="text-sm font-medium text-stone-700">
                    I'm bringing a plus-one
                  </span>
                </label>
                {formData.plusOneAttending && (
                  <div className="mt-4 ml-7">
                    <input
                      type="text"
                      value={formData.plusOneName}
                      onChange={(e) =>
                        setFormData({ ...formData, plusOneName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-[#b91c1c] focus:border-[#b91c1c] outline-none transition"
                      placeholder="Plus-one's name"
                    />
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Dietary Requirements
              </label>
              <textarea
                value={formData.dietaryRequirements}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dietaryRequirements: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-[#b91c1c] focus:border-[#b91c1c] outline-none transition"
                placeholder="Any dietary requirements? (vegetarian, vegan, allergies, etc.)"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Message to the Couple
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-[#b91c1c] focus:border-[#b91c1c] outline-none transition"
                placeholder="Congratulations, wishes, etc."
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !formData.status}
              className="w-full bg-[#b91c1c] text-white py-3 px-6 rounded-md font-medium hover:bg-[#991b1b] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Submitting..." : "Submit RSVP"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
