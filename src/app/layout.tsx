import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-domain.vercel.app"),
  title: "Christine & Edward — Wedding RSVP",
  description:
    "We joyfully invite you to celebrate our wedding on 26 March 2026. Kindly RSVP by clicking below.",
  openGraph: {
    title: "Christine & Edward — Wedding Invitation 💍",
    description:
      "You're invited to celebrate our special day! Please RSVP to let us know if you'll be joining us on 26 March 2026.",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Christine & Edward Wedding Invitation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Christine & Edward — Wedding RSVP",
    description: "You're invited! Please RSVP for our wedding on 26 March 2026.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`}>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
