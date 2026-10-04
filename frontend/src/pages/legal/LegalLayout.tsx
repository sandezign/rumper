import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ChevronRight, 
  ArrowLeft, 
  ArrowUpRight, 
  Menu, 
  X, 
  ShieldCheck, 
  FileText, 
  Lock,
  Compass
} from "lucide-react";
import KineticGrid from "@/components/ui/kinetic-grid";
import "./LegalLayout.css";

export interface TocItem {
  id: string;
  label: string;
}

interface LegalLayoutProps {
  title: string;
  badge: string;
  subtitle: string;
  lastUpdated: string;
  tocItems: TocItem[];
  children: React.ReactNode;
}

export default function LegalLayout({
  title,
  badge,
  subtitle,
  lastUpdated,
  tocItems,
  children,
}: LegalLayoutProps) {
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Calculate reading scroll progress and scroll-spy
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100);
      }

      setIsScrolled(window.scrollY > 20);

      // Scroll spy for TOC
      const scrollPosition = window.scrollY + 140;
      for (let i = tocItems.length - 1; i >= 0; i--) {
        const el = document.getElementById(tocItems[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(tocItems[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tocItems]);

  // Scroll to top on route change & close mobile menu
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("legal-mobile-locked");
    } else {
      document.body.classList.remove("legal-mobile-locked");
    }
    return () => {
      document.body.classList.remove("legal-mobile-locked");
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/terms", label: "Syarat Layanan", icon: FileText },
    { href: "/privacy", label: "Kebijakan Privasi", icon: ShieldCheck },
    { href: "/security", label: "Keamanan", icon: Lock },
  ];

  // Tailored chip label based on active route
  const getChipDetails = () => {
    if (location.pathname.includes("/privacy")) {
      return {
        label: "Perlindungan Privasi Resmi · Kepatuhan UU PDP No. 27/2022",
        href: "/privacy",
      };
    }
    if (location.pathname.includes("/security")) {
      return {
        label: "Standar Keamanan Data · Enkripsi Standar Perbankan",
        href: "/security",
      };
    }
    return {
      label: "Ketentuan Layanan Resmi · 100% Independen Tanpa Komisi",
      href: "/terms",
    };
  };

  const chipDetails = getChipDetails();

  return (
    <div className="legal-hub-container">
      {/* Scroll Reading Progress Bar */}
      <div
        className="legal-reading-progress"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Floating Dark Glass Navbar — Aligned 100% with Landing V2 */}
      <div className={`legal-nav-wrap ${isScrolled ? "scrolled" : ""}`}>
        {/* Ambient Dimming Backdrop for mobile expansion */}
        <div 
          className={`legal-nav-backdrop ${mobileMenuOpen ? "is-active" : ""}`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />

        <nav className={`legal-nav ${mobileMenuOpen ? "is-expanded" : ""}`} id="legalNav">
          <div className="legal-nav-header">
            {/* Brand */}
            <Link to="/" className="legal-brand" aria-label="Rumper Beranda">
              <span className="legal-brandmark" aria-hidden="true">
                <svg viewBox="0 0 30 30" fill="none">
                  <path
                    d="M15.0515 3.50391H15.0457L15.0964 3.51953C15.1082 3.52428 15.1192 3.52992 15.1297 3.53613L15.2 3.59082L15.5066 3.85254L15.5115 3.85742L15.5173 3.8623C18.2257 6.10888 21.6488 7.31502 25.1687 7.26367H25.1824L25.6111 7.25098H25.6277C25.6841 7.24842 25.7399 7.26413 25.7859 7.29688C25.8328 7.33035 25.8653 7.37786 25.8806 7.42969C26.4577 9.39036 26.6346 11.4474 26.4002 13.4775C26.1657 15.5077 25.5252 17.4709 24.5164 19.249C23.5076 21.0269 22.1498 22.5847 20.5261 23.8291C18.9026 25.0732 17.045 25.979 15.0642 26.4922C15.023 26.5028 14.979 26.503 14.9373 26.4922C12.9562 25.9791 11.098 25.0732 9.47438 23.8291C7.85076 22.5849 6.49416 21.0263 5.48512 19.248C4.47617 17.4699 3.83483 15.5075 3.60036 13.4775C3.36592 11.4474 3.5428 9.39042 4.11989 7.42969C4.13523 7.3778 4.16773 7.33032 4.21461 7.29688C4.26065 7.26408 4.31647 7.24842 4.37282 7.25098C8.04755 7.41871 11.6533 6.20992 14.4832 3.8623L14.489 3.85742L14.4949 3.85156L14.8054 3.58496L14.867 3.53711C14.8787 3.52979 14.8907 3.52431 14.9021 3.51953L14.95 3.50488C14.9518 3.50455 14.9538 3.50422 14.9558 3.50391L14.9998 3.50098L15.0515 3.50391Z"
                    stroke="#00ED64"
                    strokeWidth="2"
                  />
                  <path
                    d="M19.2424 9.80155C20.344 10.9307 20.974 12.4547 20.9992 14.0514C21.0245 15.648 20.443 17.1922 19.3778 18.3573L19.2424 18.5009L16.4138 21.3999C16.0549 21.7677 15.5731 21.9818 15.066 21.9989C14.5588 22.016 14.0643 21.8349 13.6826 21.4922L13.5866 21.3999L10.7573 18.5002C9.63213 17.3467 9 15.7822 9 14.1509C9 12.5196 9.63213 10.9551 10.7573 9.80155C11.8825 8.64804 13.4086 8 14.9999 8C16.5911 8 18.1172 8.64804 19.2424 9.80155ZM14.9999 12.1006C14.7372 12.1006 14.4772 12.1536 14.2345 12.2567C13.9919 12.3597 13.7714 12.5107 13.5857 12.7011C13.4 12.8915 13.2527 13.1175 13.1522 13.3663C13.0517 13.615 12.9999 13.8816 12.9999 14.1509C12.9999 14.4201 13.0517 14.6867 13.1522 14.9355C13.2527 15.1842 13.4 15.4102 13.5857 15.6006C13.7714 15.791 13.9919 15.942 14.2345 16.0451C14.4772 16.1481 14.7372 16.2011 14.9999 16.2011C15.5303 16.2011 16.039 15.9851 16.4141 15.6006C16.7891 15.2161 16.9998 14.6946 16.9998 14.1509C16.9998 13.6071 16.7891 13.0856 16.4141 12.7011C16.039 12.3166 15.5303 12.1006 14.9999 12.1006Z"
                    fill="#5085FF"
                  />
                </svg>
              </span>
              <span>Rumper</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="legal-nav-links">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`legal-nav-link ${isActive ? "active" : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Action Buttons — No dark mode toggle button */}
            <div className="legal-nav-actions">
              <Link to="/v2/start" className="legal-btn-accent">
                <span>Cek Lokasi (Gratis)</span>
                <span className="arrow" aria-hidden="true">→</span>
              </Link>

              {/* Hamburger Button for Mobile */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="legal-btn-nav-more"
                aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu navigasi"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Fluid Mobile Menu Dropdown inside Island */}
          {mobileMenuOpen && (
            <div className="legal-mobile-menu-body">
              <div className="legal-mobile-menu-scroll">
                <nav className="legal-mobile-nav-items">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 px-3 pt-2 pb-1">
                    Navigasi Hub Legal
                  </div>
                  {navLinks.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`legal-mobile-nav-item ${isActive ? "active" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon ? (
                            <item.icon className="w-4 h-4 text-[#00ed64]" />
                          ) : (
                            <Compass className="w-4 h-4 text-[#00ed64]" />
                          )}
                          <span>{item.label}</span>
                        </div>
                        <span className="text-white/40">→</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="pt-4 border-t border-white/10 mt-auto">
                  <Link
                    to="/v2/start"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold bg-[#00ed64] text-[#001e2b] shadow-lg shadow-[#00ed64]/20"
                  >
                    <span>Coba Cek Lokasi Sekarang</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Hero Header Area — With Dark Canvas & KineticGrid Animation */}
      <header className="legal-hero-wrapper">
        <KineticGrid
          className="legal-hero-grid min-h-0"
          transparentBg={true}
          globalColor="default"
        >
          <div className="legal-hero-centered">
            {/* Breadcrumb row */}
            <nav aria-label="Breadcrumb" className="legal-breadcrumb-row">
              <Link to="/" className="legal-breadcrumb-link">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Beranda</span>
              </Link>
              <span className="legal-breadcrumb-sep">/</span>
              <span className="legal-breadcrumb-muted">Legal & Kepercayaan</span>
              <span className="legal-breadcrumb-sep">/</span>
              <span className="legal-breadcrumb-current">{badge}</span>
            </nav>

            {/* Transparent Chip Pill Label (Matching Landing V2 Hero) */}
            <div className="legal-pill" aria-label={chipDetails.label}>
              <svg 
                className="legal-pill-pin" 
                viewBox="0 0 24 24" 
                width="16" 
                height="16" 
                fill="none" 
                stroke="#00ED64" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                aria-hidden="true"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{chipDetails.label}</span>
              <span className="legal-pill-arrow-btn" aria-hidden="true">→</span>
            </div>

            {/* Main Headline */}
            <h1 className="legal-hero-h1">{title}</h1>

            {/* Lead Description */}
            <p className="legal-hero-lead">{subtitle}</p>

            {/* Micro Trust Indicators (Transparent chips, no icons, left-aligned) */}
            <div className="legal-hero-micro">
              <span className="legal-info-chip">
                Pembaruan: <strong>{lastUpdated}</strong>
              </span>
              <span className="legal-info-chip">
                Yurisdiksi: <strong>Republik Indonesia</strong>
              </span>
              <span className="legal-info-chip">
                Kepatuhan: <strong>UU PDP No. 27/2022</strong>
              </span>
            </div>
          </div>
        </KineticGrid>
      </header>

      {/* Main Content Canvas with Mixed Combination Background */}
      <div className="legal-content-canvas">
        <main className="container mx-auto px-4 sm:px-6 py-10 sm:py-14" style={{ width: "var(--container)" }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Sticky Table of Contents (Desktop) */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-5">
              <div className="legal-toc-card">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3 pb-2 border-b border-[var(--line-soft)] flex items-center justify-between">
                  <span>Daftar Isi Dokumen</span>
                  <span className="w-2 h-2 rounded-full bg-[#00ed64]" />
                </div>
                <nav className="space-y-1 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
                  {tocItems.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`legal-toc-link ${isActive ? "active" : ""}`}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Sibling documents card with Landing V2 dark contrast */}
              <div className="legal-dark-card space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#00ed64]">
                  Dokumen Resmi Lainnya
                </div>
                <div className="space-y-1.5 text-xs">
                  {navLinks.filter(n => n.href !== "/").map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                        location.pathname === item.href
                          ? "bg-[#00ed64] text-[#001e2b] font-bold shadow-md"
                          : "text-[#d0dde0] hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon && <item.icon className="w-3.5 h-3.5" />}
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

            {/* Right Column: Article Content */}
            <article className="lg:col-span-8 max-w-3xl w-full space-y-8">
              {children}

              {/* Bottom Actions */}
              <div className="mt-12 pt-8 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[var(--ink)] hover:text-[#008c34] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Beranda Rumper</span>
                </Link>

                <Link to="/v2/start" className="legal-btn-accent">
                  <span>Cek Risiko Rumah (Gratis)</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          </div>
        </main>
      </div>

      {/* Global Compact Footer — Matching Landing V2 */}
      <footer className="legal-footer">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ width: "var(--container)" }}>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[var(--ink)]">Rumper</span>
            <span>·</span>
            <span>© 2026 Rumper Indonesia. Evaluasi independen untuk keputusan rumah pertama.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-semibold text-xs text-[var(--muted)]">
            <Link to="/terms" className="hover:text-[var(--ink)]">Syarat Layanan</Link>
            <Link to="/privacy" className="hover:text-[var(--ink)]">Kebijakan Privasi</Link>
            <Link to="/security" className="hover:text-[var(--ink)]">Keamanan</Link>
            <a
              href="https://wa.me/6281289000000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#008c34] hover:underline"
            >
              WhatsApp Bantuan
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
