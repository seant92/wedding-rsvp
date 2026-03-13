"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeCardProps {
  url: string;
}

export default function QRCodeCard({ url }: QRCodeCardProps) {
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQR = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // White background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size);

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      const link = document.createElement("a");
      link.download = "wedding-rsvp-qr.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="card-elegant p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-lg text-charcoal">Share RSVP Link</h2>
          <p className="text-xs font-sans text-stone mt-0.5">Scan or share with guests via WhatsApp</p>
        </div>
        <span className="ornament text-lg">✦</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* QR Code */}
        <div
          className="p-3 rounded-xl flex-shrink-0"
          style={{ background: "white", border: "2px solid var(--gold-light)" }}
        >
          <QRCodeSVG
            ref={svgRef}
            value={url}
            size={140}
            fgColor="#2D1B1E"
            bgColor="#FFFFFF"
            level="M"
            includeMargin={false}
          />
        </div>

        {/* Actions */}
        <div className="flex-1 space-y-3 w-full">
          <div>
            <p className="text-xs font-sans text-stone mb-1.5 uppercase tracking-wider">RSVP Link</p>
            <div
              className="rounded-lg px-3 py-2 text-xs font-sans text-stone break-all"
              style={{ background: "var(--champagne)", border: "1px solid var(--gold-light)" }}
            >
              {url}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-sans font-semibold transition-all"
              style={{
                background: copied ? "rgba(34,197,94,0.1)" : "var(--champagne)",
                border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "var(--gold-light)"}`,
                color: copied ? "#16a34a" : "var(--charcoal)",
              }}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Link
                </>
              )}
            </button>

            <button
              onClick={downloadQR}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-sans font-semibold transition-all btn-gold"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download QR
            </button>
          </div>

          {/* WhatsApp share */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`You're invited to Christine & Edward's Wedding! 💍\n\nKindly RSVP here: ${url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-sans font-semibold transition-all"
            style={{ background: "#25D366", color: "white" }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Share on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
