"use client";

import { useState, useEffect, useCallback } from "react";
import { addGuest } from "@/lib/db";
import { Venue, WeddingData } from "@/types";

interface RSVPClientProps {
  initialVenues: Venue[];
  initialWeddingData: WeddingData | null;
}

const WEDDING_DATE = new Date("2026-03-26T10:00:00+02:00");

function useCountdown(target: Date) {
  const calc = useCallback(() => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      passed: false,
    };
  }, [target]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return time;
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-serif font-bold text-white"
        style={{ background: "linear-gradient(135deg, #7A2D45, #5D1E32)", boxShadow: "0 4px 16px rgba(122,45,69,0.35)" }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-1.5 text-xs uppercase tracking-widest font-sans text-stone-500">{label}</span>
    </div>
  );
}

function FloralSVG() {
  return (
    <svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto opacity-30">
      <path d="M100 40 C80 20, 60 30, 50 40 C60 50, 80 60, 100 40Z" fill="#C9A85C" />
      <path d="M100 40 C120 20, 140 30, 150 40 C140 50, 120 60, 100 40Z" fill="#C9A85C" />
      <path d="M100 40 C90 15, 100 0, 100 0 C100 0, 110 15, 100 40Z" fill="#A8863D" />
      <path d="M100 40 C90 65, 100 80, 100 80 C100 80, 110 65, 100 40Z" fill="#A8863D" />
      <circle cx="100" cy="40" r="5" fill="#C9A85C" />
      <circle cx="30" cy="40" r="3" fill="#C9A85C" opacity="0.5" />
      <circle cx="170" cy="40" r="3" fill="#C9A85C" opacity="0.5" />
      <line x1="10" y1="40" x2="45" y2="40" stroke="#C9A85C" strokeWidth="0.8" opacity="0.5" />
      <line x1="155" y1="40" x2="190" y2="40" stroke="#C9A85C" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

function SuccessScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div
        className="max-w-md w-full text-center animate-fade-in-up"
        style={{ animationFillMode: "both" }}
      >
        {/* Animated rings */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "linear-gradient(135deg, #F5ECD7, #E8D5A3)", animation: "pulse-soft 2s ease-in-out infinite" }}
          />
          <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
            <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
              <path d="M8 20C8 20 12 8 20 8C28 8 32 20 32 20" stroke="#C9A85C" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 20C8 20 12 32 20 32C28 32 32 20 32 20" stroke="#7A2D45" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="20" cy="20" r="4" fill="#C9A85C"/>
            </svg>
          </div>
        </div>

        <div className="gold-divider mb-4" />
        <h1 className="text-3xl font-serif text-charcoal mb-3">Thank You!</h1>
        <p className="text-stone font-sans mb-2">
          Your RSVP has been received beautifully.
        </p>
        <p className="text-stone font-sans text-sm mb-6">
          We're so delighted you'll be celebrating with us on this special day.
        </p>
        <div className="gold-divider mb-6" />
        <p className="text-xs font-sans text-stone-400 tracking-wider uppercase">
          With love — Christine & Edward
        </p>
      </div>
    </div>
  );
}

export default function RSVPClient({ initialVenues, initialWeddingData }: RSVPClientProps) {
  const [venues] = useState<Venue[]>(initialVenues);
  const [weddingData] = useState<WeddingData | null>(initialWeddingData);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const countdown = useCountdown(WEDDING_DATE);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    status: "" as "yes" | "no" | "maybe" | "",
    plusOneAttending: false,
    plusOneName: "",
    dietaryRequirements: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.status) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await addGuest({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        status: formData.status as "yes" | "no" | "maybe",
        plusOne: {
          attending: formData.plusOneAttending,
          name: formData.plusOneName.trim(),
        },
        dietaryRequirements: formData.dietaryRequirements.trim(),
        message: formData.message.trim(),
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return <SuccessScreen />;

  return (
    <div className="min-h-screen bg-cream">

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        {/* Subtle textured background */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 20% 50%, rgba(201,168,92,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(122,45,69,0.06) 0%, transparent 50%)",
          }}
        />

        <div className="relative max-w-2xl mx-auto px-6 pt-16 pb-12 text-center">
          {/* Top ornament */}
          <div className="ornament mb-4 animate-fade-in">✦ ✦ ✦</div>

          {/* Monogram */}
          <div
            className="inline-flex items-center gap-3 mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.1s", animationFillMode: "both" }}
          >
            <span className="text-4xl sm:text-5xl font-serif text-charcoal">C</span>
            <span className="text-2xl sm:text-3xl font-serif" style={{ color: "var(--gold)" }}>&</span>
            <span className="text-4xl sm:text-5xl font-serif text-charcoal">E</span>
          </div>

          {/* Names */}
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-serif text-charcoal leading-tight mb-3 animate-fade-in-up"
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          >
            Christine <span style={{ color: "var(--gold)" }}>&</span> Edward
          </h1>

          {/* Floral divider */}
          <div
            className="my-6 animate-fade-in"
            style={{ animationDelay: "0.3s", animationFillMode: "both" }}
          >
            <FloralSVG />
          </div>

          {/* Invitation text */}
          <p
            className="font-sans text-stone text-sm sm:text-base italic leading-relaxed mb-2 animate-fade-in-up"
            style={{ animationDelay: "0.35s", animationFillMode: "both" }}
          >
            Together with their families
          </p>
          <p
            className="font-sans text-stone text-sm sm:text-base italic leading-relaxed mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.4s", animationFillMode: "both" }}
          >
            request the honour of your presence
          </p>

          {/* Date */}
          <div
            className="mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.45s", animationFillMode: "both" }}
          >
            <div className="inline-flex items-center gap-3">
              <div className="h-px w-8 sm:w-16" style={{ background: "var(--gold)" }} />
              <p className="font-serif text-charcoal text-base sm:text-lg">
                Thursday · 26 March 2026
              </p>
              <div className="h-px w-8 sm:w-16" style={{ background: "var(--gold)" }} />
            </div>
          </div>

          {/* Countdown */}
          {!countdown.passed && (
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.55s", animationFillMode: "both" }}
            >
              <p className="text-xs font-sans uppercase tracking-widest text-stone-400 mb-4">Counting down</p>
              <div className="flex justify-center gap-3 sm:gap-5">
                <CountdownBox value={countdown.days} label="Days" />
                <CountdownBox value={countdown.hours} label="Hours" />
                <CountdownBox value={countdown.minutes} label="Mins" />
                <CountdownBox value={countdown.seconds} label="Secs" />
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="gold-divider-full" />

      {/* ── Invitation Card ── */}
      {(weddingData?.cardImageUrl || weddingData?.cardPdfUrl) && (
        <section className="max-w-3xl mx-auto px-4 py-10">
          {weddingData.cardImageUrl && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 8px 40px rgba(44,27,30,0.12), 0 0 0 4px rgba(201,168,92,0.2)" }}
            >
              <img
                src={weddingData.cardImageUrl}
                alt="Wedding Invitation"
                className="w-full h-auto"
              />
            </div>
          )}
          {weddingData.cardPdfUrl && (
            <div className="text-center mt-6">
              <a
                href={weddingData.cardPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Invitation (PDF)
              </a>
            </div>
          )}
        </section>
      )}

      {/* ── Wedding Details / Venues ── */}
      {venues.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <p className="ornament mb-2">✦</p>
            <h2 className="text-2xl sm:text-3xl font-serif text-charcoal">Wedding Details</h2>
            <div className="gold-divider mt-3" />
          </div>

          <div className={`grid gap-6 ${venues.length === 1 ? "max-w-md mx-auto" : venues.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
            {venues.map((venue, i) => (
              <div
                key={venue.id}
                className="card-elegant overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}
              >
                {/* Gold left accent */}
                <div className="flex">
                  <div className="w-1 flex-shrink-0" style={{ background: "linear-gradient(to bottom, #C9A85C, #A8863D)" }} />
                  <div className="flex-1 p-5">
                    <h3 className="font-serif text-lg text-charcoal mb-1">{venue.name}</h3>
                    <p className="font-sans text-stone text-sm mb-3 leading-relaxed">{venue.address}</p>
                    {venue.date && (
                      <div className="flex items-center gap-2 text-sm font-sans text-stone mb-1">
                        <svg className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gold)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {venue.date}
                      </div>
                    )}
                    {venue.time && (
                      <div className="flex items-center gap-2 text-sm font-sans text-stone">
                        <svg className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gold)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {venue.time}
                      </div>
                    )}
                  </div>
                </div>
                {venue.mapEmbedUrl && (
                  <div className="h-44 bg-stone-100 border-t border-champagne">
                    <iframe
                      src={venue.mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={venue.name}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="gold-divider-full" />

      {/* ── RSVP Form ── */}
      <section className="max-w-xl mx-auto px-4 py-10 pb-20">
        <div className="text-center mb-8">
          <p className="ornament mb-2">✦</p>
          <h2 className="text-2xl sm:text-3xl font-serif text-charcoal">Kindly Reply</h2>
          <p className="font-sans text-stone text-sm mt-2">
            Please let us know if you'll be joining us
          </p>
          <div className="gold-divider mt-3" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="card-elegant p-6 sm:p-8 space-y-6 animate-fade-in-up"
          style={{ animationDelay: "0.2s", animationFillMode: "both" }}
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-sans font-semibold text-charcoal mb-2">
              Full Name <span style={{ color: "var(--gold)" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-elegant"
              placeholder="Your full name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-sans font-semibold text-charcoal mb-2">
              Phone Number <span style={{ color: "var(--gold)" }}>*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-elegant"
              placeholder="+27 00 000 0000"
            />
          </div>

          {/* Attendance */}
          <div>
            <label className="block text-sm font-sans font-semibold text-charcoal mb-3">
              Will you attend? <span style={{ color: "var(--gold)" }}>*</span>
            </label>
            <div className="space-y-2.5">
              {[
                { value: "yes", label: "Joyfully accepts", icon: "🎉" },
                { value: "no", label: "Regretfully declines", icon: "💌" },
                { value: "maybe", label: "Tentatively accepts", icon: "🤍" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all"
                  style={{
                    background: formData.status === option.value ? "rgba(201,168,92,0.12)" : "rgba(245,236,215,0.4)",
                    border: formData.status === option.value ? "1.5px solid var(--gold)" : "1.5px solid transparent",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: formData.status === option.value ? "var(--gold)" : "#D4C4B0",
                      background: formData.status === option.value ? "var(--gold)" : "white",
                    }}
                  >
                    {formData.status === option.value && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={formData.status === option.value}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "yes" | "no" | "maybe" })}
                    className="sr-only"
                  />
                  <span className="text-sm font-sans text-charcoal">{option.icon} {option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Plus One (only when yes) */}
          {formData.status === "yes" && (
            <div
              className="border-t pt-5 animate-fade-in"
              style={{ borderColor: "var(--gold-light)" }}
            >
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0"
                  style={{
                    borderColor: formData.plusOneAttending ? "var(--gold)" : "#D4C4B0",
                    background: formData.plusOneAttending ? "var(--gold)" : "white",
                  }}
                  onClick={() => setFormData({ ...formData, plusOneAttending: !formData.plusOneAttending })}
                >
                  {formData.plusOneAttending && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={formData.plusOneAttending}
                  onChange={(e) => setFormData({ ...formData, plusOneAttending: e.target.checked })}
                  className="sr-only"
                />
                <span className="text-sm font-sans font-semibold text-charcoal">I'm bringing a plus-one</span>
              </label>
              {formData.plusOneAttending && (
                <div className="ml-8 animate-fade-in">
                  <input
                    type="text"
                    value={formData.plusOneName}
                    onChange={(e) => setFormData({ ...formData, plusOneName: e.target.value })}
                    className="input-elegant"
                    placeholder="Plus-one's full name"
                  />
                </div>
              )}
            </div>
          )}

          {/* Dietary requirements */}
          <div>
            <label className="block text-sm font-sans font-semibold text-charcoal mb-2">
              Dietary Requirements
              <span className="font-normal text-stone ml-1 text-xs">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.dietaryRequirements}
              onChange={(e) => setFormData({ ...formData, dietaryRequirements: e.target.value })}
              className="input-elegant"
              placeholder="Vegetarian, halal, allergies, etc."
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-sans font-semibold text-charcoal mb-2">
              Message to the Couple
              <span className="font-normal text-stone ml-1 text-xs">(optional)</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="input-elegant resize-none"
              placeholder="Share your heartfelt wishes..."
              rows={3}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-sans text-center">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !formData.status}
            className="btn-primary w-full"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending RSVP...
              </span>
            ) : (
              "Send My RSVP ✦"
            )}
          </button>
        </form>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t pb-10 pt-6 text-center" style={{ borderColor: "var(--gold-light)" }}>
        <div className="ornament mb-2">✦</div>
        <p className="font-serif text-stone text-sm">
          With love — Christine & Edward
        </p>
        <p className="font-sans text-stone-400 text-xs mt-1">26 March 2026</p>
      </footer>
    </div>
  );
}
