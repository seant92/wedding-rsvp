"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }
    fetch("/api/auth/check")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/admin/login");
        } else {
          setLoading(false);
        }
      })
      .catch(() => router.push("/admin/login"));
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone font-sans text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/venues", label: "Venues" },
    { href: "/admin/guests", label: "Guests" },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white shadow-sm border-b border-champagne sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-gold text-lg">✦</span>
                <h1 className="text-lg font-serif text-charcoal">Wedding Admin</h1>
              </div>
              <nav className="hidden md:flex gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-sans font-medium transition pb-1 ${
                      pathname === item.href
                        ? "text-gold border-b-2 border-gold"
                        : "text-stone hover:text-charcoal"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                target="_blank"
                className="hidden md:inline-flex text-xs font-sans text-stone hover:text-gold transition items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View RSVP Page
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-sans text-stone hover:text-burgundy transition"
              >
                Logout
              </button>
              {/* Mobile menu button */}
              <button
                className="md:hidden text-stone hover:text-charcoal"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-champagne py-3 space-y-2 pb-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-2 py-2 text-sm font-sans rounded-lg transition ${
                    pathname === item.href
                      ? "text-gold bg-champagne font-medium"
                      : "text-stone hover:text-charcoal hover:bg-champagne"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/"
                target="_blank"
                className="block px-2 py-2 text-xs font-sans text-stone hover:text-gold transition"
              >
                View RSVP Page ↗
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
