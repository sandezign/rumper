// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import KineticGrid from "@/components/ui/kinetic-grid";
import "./LandingV3.css";

const CARDS_DATA = [
  {
    id: 0,
    name: "Grand Galaxy City",
    location: "Bekasi Selatan",
    status: "Risiko Sedang–Tinggi",
    statusBg: "#fff8e0",
    statusColor: "#b76e00",
    findings: "3 temuan perlu divalidasi",
    score: "68/100",
    markerBg: "#f5b73b",
    markerLeft: "52%",
    markerTop: "48%",
    haloBg: "radial-gradient(circle at 45% 45%, rgba(215, 154, 43, 0.28), transparent 70%)"
  },
  {
    id: 1,
    name: "Kota Wisata",
    location: "Cibubur",
    status: "Risiko Rendah–Sedang",
    statusBg: "#fff8e0",
    statusColor: "#b76e00",
    findings: "1 temuan mobilitas jam sibuk",
    score: "82/100",
    markerBg: "#f5b73b",
    markerLeft: "42%",
    markerTop: "58%",
    haloBg: "radial-gradient(circle at 45% 50%, rgba(215,154,43,.32), transparent 72%)"
  },
  {
    id: 2,
    name: "BSD City",
    location: "Tangerang Selatan",
    status: "Sangat Selaras",
    statusBg: "#eaf5ef",
    statusColor: "#00684a",
    findings: "Fasilitas lengkap · Bebas SUTET",
    score: "94/100",
    markerBg: "#00ed64",
    markerLeft: "50%",
    markerTop: "50%",
    haloBg: "radial-gradient(circle at 50% 50%, rgba(0,237,100,.24), transparent 70%)"
  },
  {
    id: 3,
    name: "PIK 2",
    location: "Jakarta Utara",
    status: "Perlu Validasi",
    statusBg: "#ffeaee",
    statusColor: "#d32f2f",
    findings: "Pesisir rob · Ketergantungan tol",
    score: "55/100",
    markerBg: "#ef5350",
    markerLeft: "50%",
    markerTop: "50%",
    haloBg: "radial-gradient(circle at 50% 50%, rgba(211,47,47,.32), transparent 72%)"
  }
];

export default function LandingV3() {
  const [activeCardId, setActiveCardId] = useState(0);
  const [cardOrders, setCardOrders] = useState([0, 1, 2, 3]);
  const [isTossing, setIsTossing] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [query, setQuery] = useState("");

  // Select card by tab click
  const handleSelectCard = (targetId) => {
    setActiveCardId(targetId);
    setCardOrders((prev) => {
      const currentOrder = prev[targetId];
      if (currentOrder === 0) return prev;
      return prev.map((ord) => (ord - currentOrder + 4) % 4);
    });
  };

  // Cycle next card on top card click
  const handleCycleNext = () => {
    setIsTossing(true);
    setTimeout(() => {
      const nextTargetId = (activeCardId + 1) % 4;
      handleSelectCard(nextTargetId);
      setIsTossing(false);
    }, 140);
  };

  // Sticky CTA observer on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 480) {
        setShowStickyCta(true);
      } else {
        setShowStickyCta(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const dest = query.trim() ? `/app/start?q=${encodeURIComponent(query.trim())}` : "/app/start";
    window.location.href = dest;
  };

  return (
    <div className="v3-body">
      {/* ─────────────────────────────────────────────────────────
       * TOP NAVIGATION
       * ───────────────────────────────────────────────────────── */}
      <div className="nav-wrap" id="navWrap">
        <nav className="nav">
          <a className="brand" href="#top" aria-label="Rumper">
            <span className="brandmark" aria-hidden="true">
              <svg viewBox="0 0 30 30" fill="none">
                <path d="M15.0515 3.50391H15.0457L15.0964 3.51953C15.1082 3.52428 15.1192 3.52992 15.1297 3.53613L15.2 3.59082L15.5066 3.85254L15.5115 3.85742L15.5173 3.8623C18.2257 6.10888 21.6488 7.31502 25.1687 7.26367H25.1824L25.6111 7.25098H25.6277C25.6841 7.24842 25.7399 7.26413 25.7859 7.29688C25.8328 7.33035 25.8653 7.37786 25.8806 7.42969C26.4577 9.39036 26.6346 11.4474 26.4002 13.4775C26.1657 15.5077 25.5252 17.4709 24.5164 19.249C23.5076 21.0269 22.1498 22.5847 20.5261 23.8291C18.9026 25.0732 17.045 25.979 15.0642 26.4922C15.023 26.5028 14.979 26.503 14.9373 26.4922C12.9562 25.9791 11.098 25.0732 9.47438 23.8291C7.85076 22.5849 6.49416 21.0263 5.48512 19.248C4.47617 17.4699 3.83483 15.5075 3.60036 13.4775C3.36592 11.4474 3.5428 9.39042 4.11989 7.42969C4.13523 7.3778 4.16773 7.33032 4.21461 7.29688C4.26065 7.26408 4.31647 7.24842 4.37282 7.25098C8.04755 7.41871 11.6533 6.20992 14.4832 3.8623L14.489 3.85742L14.4949 3.85156L14.8054 3.58496L14.867 3.53711C14.8787 3.52979 14.8907 3.52431 14.9021 3.51953L14.95 3.50488C14.9518 3.50455 14.9538 3.50422 14.9558 3.50391L14.9998 3.50098L15.0515 3.50391Z" stroke="#00ED64" strokeWidth="2"/>
                <path d="M19.2424 9.80155C20.344 10.9307 20.974 12.4547 20.9992 14.0514C21.0245 15.648 20.443 17.1922 19.3778 18.3573L19.2424 18.5009L16.4138 21.3999C16.0549 21.7677 15.5731 21.9818 15.066 21.9989C14.5588 22.016 14.0643 21.8349 13.6826 21.4922L13.5866 21.3999L10.7573 18.5002C9.63213 17.3467 9 15.7822 9 14.1509C9 12.5196 9.63213 10.9551 10.7573 9.80155C11.8825 8.64804 13.4086 8 14.9999 8C16.5911 8 18.1172 8.64804 19.2424 9.80155ZM14.9999 12.1006C14.7372 12.1006 14.4772 12.1536 14.2345 12.2567C13.9919 12.3597 13.7714 12.5107 13.5857 12.7011C13.4 12.8915 13.2527 13.1175 13.1522 13.3663C13.0517 13.615 12.9999 13.8816 12.9999 14.1509C12.9999 14.4201 13.0517 14.6867 13.1522 14.9355C13.2527 15.1842 13.4 15.4102 13.5857 15.6006C13.7714 15.791 13.9919 15.942 14.2345 16.0451C14.4772 16.1481 14.7372 16.2011 14.9999 16.2011C15.5303 16.2011 16.039 15.9851 16.4141 15.6006C16.7891 15.2161 16.9998 14.6946 16.9998 14.1509C16.9998 13.6071 16.7891 13.0856 16.4141 12.7011C16.039 12.3166 15.5303 12.1006 14.9999 12.1006Z" fill="#5085FF"/>
              </svg>
            </span>
            Rumper
          </a>
          <div className="nav-links">
            <a href="#sebelum-sesudah">Sebelum & Sesudah</a>
            <a href="#cara-kerja">Cara Kerja</a>
            <a href="#fitur">Fitur</a>
            <a href="#integritas">Integritas</a>
            <a href="#harga">Harga</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-actions">
            <a className="btn btn-accent" href="/login">Masuk</a>
          </div>
        </nav>
      </div>

      {/* ─────────────────────────────────────────────────────────
       * HERO BANNER (1:1 Exact Match with Reference Screenshot)
       * ───────────────────────────────────────────────────────── */}
      <KineticGrid className="hero-wrapper min-h-0" transparentBg={true} globalColor="default">
        <div className="hero-centered">
          <a href="/app/start" className="pill" aria-label="Audit risiko lokasi sebelum DP - Jabodetabek">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00ED64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Audit Risiko Lokasi Sebelum DP · Jabodetabek</span>
            <span className="pill-arrow-btn" aria-hidden="true">→</span>
          </a>

          <h1>Sudah suka rumahnya?<br /><span className="accent">Cek dulu risiko lokasinya.</span></h1>
          <p className="lead">Verifikasi riwayat banjir, macet jam kerja, dan perimeter aman sebelum bayar tanda jadi atau DP.</p>

          <form className="search-box" onSubmit={handleSearchSubmit}>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z" />
              <path d="M9 21V12h6v9" />
            </svg>
            <input
              aria-label="Alamat atau nama perumahan"
              placeholder="Contoh: Grand Galaxy Bekasi"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn btn-accent" type="submit">Cek Lokasi <span className="arrow">→</span></button>
          </form>

          <div className="hero-micro">
            <span>
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="9" fill="rgba(0,237,100,0.15)" stroke="#00ED64" strokeWidth="1.5" />
                <path d="m6.5 10 2.5 2.5 5-5" stroke="#00ED64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              4 Sumber geospasial resmi
            </span>
            <span>
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="9" fill="rgba(0,237,100,0.15)" stroke="#00ED64" strokeWidth="1.5" />
                <path d="m6.5 10 2.5 2.5 5-5" stroke="#00ED64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              100% Independen tanpa komisi
            </span>
            <span>
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="9" fill="rgba(0,237,100,0.15)" stroke="#00ED64" strokeWidth="1.5" />
                <path d="m6.5 10 2.5 2.5 5-5" stroke="#00ED64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              1 Cek lokasi awal gratis
            </span>
          </div>

          <div className="hero-card-stage" aria-label="Contoh tampilan laporan Rumper">
            <div className="report-tabs" role="tablist">
              {CARDS_DATA.map((card) => (
                <button
                  key={card.id}
                  className={`mini-tab ${activeCardId === card.id ? "active" : ""}`}
                  onClick={() => handleSelectCard(card.id)}
                  role="tab"
                  aria-selected={activeCardId === card.id}
                >
                  {card.name.split(" ")[0]}
                </button>
              ))}
            </div>

            <div className="card-stack" onClick={handleCycleNext}>
              {CARDS_DATA.map((card) => {
                const order = cardOrders[card.id];
                const isTop = order === 0;
                return (
                  <div
                    key={card.id}
                    className={`floating-report stacked ${isTop && isTossing ? "tossing-card" : ""}`}
                    data-id={card.id}
                    data-order={order}
                    tabIndex={0}
                    role="button"
                    aria-label={`Laporan ${card.name}`}
                  >
                    <div className="report-head">
                      <div className="report-location">
                        <div
                          className="pin"
                          style={{
                            width: "36px",
                            height: "36px",
                            minWidth: "36px",
                            minHeight: "36px",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            background: "#eaf5ef",
                            color: "#00684a"
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", margin: "auto" }}>
                            <path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5Z" />
                          </svg>
                        </div>
                        <div>
                          <strong style={{ fontSize: "16px", color: "#07263a" }}>{card.name}</strong>
                          <div style={{ marginTop: "2px", fontSize: "13px", color: "var(--muted)" }}>{card.location}</div>
                        </div>
                      </div>
                      <span className="risk-chip" style={{ background: card.statusBg, color: card.statusColor }}>
                        {card.status}
                      </span>
                    </div>

                    <div className="map">
                      <div className="risk-zone" style={{ background: card.haloBg }} />
                      <div
                        className="property-marker"
                        style={{
                          left: card.markerLeft,
                          top: card.markerTop,
                          background: card.markerBg,
                          boxShadow: `0 0 0 6px ${card.markerBg}33`
                        }}
                      />
                      <div className="marker-label">Properti incaran</div>
                    </div>

                    <div className="report-row">
                      <div style={{ fontSize: "14px" }}>{card.findings}</div>
                      <div className="report-score">{card.score}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="stage-label">Contoh visual · data ilustratif untuk prototype (klik kartu untuk ganti)</div>
          </div>
        </div>
      </KineticGrid>

      {/* ─────────────────────────────────────────────────────────
       * 1. SEBELUM & SESUDAH (The Contrast Section - Grupy Style)
       * ───────────────────────────────────────────────────────── */}
      <section className="v3-section v3-ba-wrap" id="sebelum-sesudah">
        <div className="v3-container">
          <div className="v3-head">
            <span className="v3-eyebrow"><span className="v3-eyebrow-dot" /> Sebelum & Sesudah</span>
            <h2>Dari klaim verbal manis developer jadi audit bukti geospasial.</h2>
            <p className="lead">Jangan pertaruhkan tabungan 10–20 tahun pada brosur marketing yang hanya menceritakan sisi idealnya saja.</p>
          </div>

          <div className="v3-ba-grid">
            {/* Card Before */}
            <div className="v3-ba-card before">
              <div className="v3-ba-header">
                <span className="v3-ba-title">Klaim Brosur Developer</span>
                <span className="v3-ba-badge red">Tanpa Bukti</span>
              </div>
              <div className="v3-ba-list">
                <div className="v3-ba-item bad">
                  <span className="v3-ba-icon">✕</span>
                  <div className="v3-ba-content">
                    <strong>"100% Bebas Banjir Selamanya"</strong>
                    <p>Klaim sepihak tanpa data elevasi tanah dan mengabaikan riwayat genangan 5 tahunan di akses luar gerbang.</p>
                  </div>
                </div>
                <div className="v3-ba-item bad">
                  <span className="v3-ba-icon">✕</span>
                  <div className="v3-ba-content">
                    <strong>"Hanya 10 Menit ke Pintu Tol"</strong>
                    <p>Diukur saat tengah malam ketika jalan lengang. Kenyataannya macet parah saat jam berangkat kerja.</p>
                  </div>
                </div>
                <div className="v3-ba-item bad">
                  <span className="v3-ba-icon">✕</span>
                  <div className="v3-ba-content">
                    <strong>"Kawasan Asri & Nyaman untuk Keluarga"</strong>
                    <p>Luput menginformasikan jalur kabel transmisi SUTET 210 m tepat di belakang klaster rumah.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mid Transition */}
            <div className="v3-ba-mid" aria-hidden="true">
              <div className="v3-ba-mid-icon">→</div>
              <span className="v3-ba-mid-pill">Dipindai Mesin Rumper</span>
            </div>

            {/* Card After */}
            <div className="v3-ba-card after">
              <div className="v3-ba-header">
                <span className="v3-ba-title">Audit Geospasial Objektif Rumper</span>
                <span className="v3-ba-badge green">Data Faktual</span>
              </div>
              <div className="v3-ba-list">
                <div className="v3-ba-item good">
                  <span className="v3-ba-icon">⚠</span>
                  <div className="v3-ba-content">
                    <strong>InaRISK BNPB: Zona Sedang</strong>
                    <p>Posisi tanah relatif rendah dekat cekungan kali. Perlu verifikasi kapasitas pompa air klaster sebelum booking.</p>
                  </div>
                </div>
                <div className="v3-ba-item good">
                  <span className="v3-ba-icon">◉</span>
                  <div className="v3-ba-content">
                    <strong>Google Routes: 34 Menit Saat Puncak Pagi</strong>
                    <p>Simulasi jam sibuk 07.15 WIB mencatat waktu tempuh 2.2x lebih lama dibanding kondisi jalan lengang.</p>
                  </div>
                </div>
                <div className="v3-ba-item good">
                  <span className="v3-ba-icon">⚠</span>
                  <div className="v3-ba-content">
                    <strong>OSM Warehouse: Kabel SUTET 210 m</strong>
                    <p>Jarak aman yang direkomendasikan &gt;250 m. Dilengkapi panduan tanya satpam untuk cek dengungan kabel saat hujan.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
       * 2. CARA KERJA (3-Step Streamlined)
       * ───────────────────────────────────────────────────────── */}
      <section className="v3-section" id="cara-kerja">
        <div className="v3-container">
          <div className="v3-head">
            <span className="v3-eyebrow"><span className="v3-eyebrow-dot" /> Cara Kerja</span>
            <h2>Mulai dalam 3 langkah sebelum transfer DP.</h2>
            <p className="lead">Tidak perlu mengerti GIS atau membaca peta kontur mentah. Rumper menerjemahkan data teknis menjadi tindakan nyata.</p>
          </div>

          <div className="v3-steps-grid">
            <div className="v3-step-card">
              <div className="v3-step-top">
                <span className="v3-step-num">LANGKAH 01</span>
                <h3>Cari Alamat Incaran</h3>
                <p>Masukkan nama cluster, perumahan, atau alamat rumah yang sedang Anda taksir di wilayah Jabodetabek.</p>
              </div>
              <div className="v3-step-ui">
                <div style={{ background: "white", padding: "10px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid rgba(7,38,58,0.08)" }}>
                  <div style={{ width: "28px", height: "28px", background: "#eaf5ef", color: "#00684a", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>⌂</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: "12.5px", color: "var(--ink)", display: "block" }}>Grand Galaxy City</b>
                    <span style={{ fontSize: "11px", color: "var(--muted)" }}>Bekasi Selatan</span>
                  </div>
                  <span style={{ fontSize: "10.5px", background: "#eaf5ef", color: "#00684a", padding: "3px 7px", borderRadius: "999px", fontWeight: "700" }}>Radius 3 km</span>
                </div>
              </div>
            </div>

            <div className="v3-step-card">
              <div className="v3-step-top">
                <span className="v3-step-num">LANGKAH 02</span>
                <h3>Pindai Lingkungan</h3>
                <p>Rumper menyatukan data resmi kebencanaan, batas zonasi wilayah, simulasi macet rute kerja, dan fasilitas umum.</p>
              </div>
              <div className="v3-step-ui">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  <span style={{ background: "white", border: "1px solid rgba(7,38,58,0.08)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "650" }}>✓ Riwayat & potensi banjir</span>
                  <span style={{ background: "white", border: "1px solid rgba(7,38,58,0.08)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "650" }}>✓ Akses jalan & zonasi</span>
                  <span style={{ background: "white", border: "1px solid rgba(7,38,58,0.08)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "650" }}>✓ Simulasi macet jam kerja</span>
                  <span style={{ background: "white", border: "1px solid rgba(7,38,58,0.08)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "650" }}>✓ Fasilitas sekitar</span>
                  <span style={{ background: "white", border: "1px solid rgba(7,38,58,0.08)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "650" }}>✓ SUTET & limbah</span>
                </div>
              </div>
            </div>

            <div className="v3-step-card">
              <div className="v3-step-top">
                <span className="v3-step-num">LANGKAH 03</span>
                <h3>Bawa Contekan Lapangan</h3>
                <p>Terima ringkasan bukti lengkap dengan daftar pertanyaan investigasi untuk satpam, warga sekitar, atau developer.</p>
              </div>
              <div className="v3-step-ui">
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ background: "white", padding: "5px 8px", borderRadius: "6px", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(7,38,58,0.06)" }}>
                    <span style={{ color: "#00875a", fontWeight: "bold" }}>☑</span> Cek garis bekas air di pos satpam
                  </div>
                  <div style={{ background: "white", padding: "5px 8px", borderRadius: "6px", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(7,38,58,0.06)" }}>
                    <span style={{ color: "#00875a", fontWeight: "bold" }}>☑</span> Uji rute gerbang jam 07.15 WIB
                  </div>
                  <div style={{ background: "white", padding: "5px 8px", borderRadius: "6px", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(7,38,58,0.06)" }}>
                    <span style={{ color: "#00875a", fontWeight: "bold" }}>☑</span> Ukur jarak kabel menara SUTET
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
       * 3. BENTO FITUR UTAMA
       * ───────────────────────────────────────────────────────── */}
      <section className="v3-section" id="fitur" style={{ background: "#ffffff" }}>
        <div className="v3-container">
          <div className="v3-head">
            <span className="v3-eyebrow"><span className="v3-eyebrow-dot" /> Fitur Unggulan</span>
            <h2>Bukan peta biasa. Ini alat uji kelayakan lokasi.</h2>
            <p className="lead">Semua temuan disederhanakan menjadi bukti nyata yang melindungi keputusan finansial terbesar dalam hidup Anda.</p>
          </div>

          <div className="v3-bento-grid">
            <div className="v3-bento-card">
              <span className="v3-bento-tag">Pengecekan Komprehensif</span>
              <h3>5 Dimensi Risiko Lokasi Lengkap</h3>
              <p>Mencakup ketahanan banjir (InaRISK BNPB), aksesibilitas fisik jalan, rasio kemacetan komuter, radius faskes darurat, dan perimeter aman terhadap bahaya SUTET & TPA.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ background: "#f8faf8", padding: "12px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                  <b style={{ fontSize: "13px", color: "var(--ink)", display: "block" }}>Ketahanan Banjir</b>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>Deteksi cekungan air & riwayat genangan</span>
                </div>
                <div style={{ background: "#f8faf8", padding: "12px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                  <b style={{ fontSize: "13px", color: "var(--ink)", display: "block" }}>Bahaya Lingkungan</b>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>Perimeter aman SUTET, TPA, dan rel KA</span>
                </div>
              </div>
            </div>

            <div className="v3-bento-card">
              <span className="v3-bento-tag">Simulasi Nyata</span>
              <h3>Uji Macet Jam Kerja (Google Routes)</h3>
              <p>Jangan percaya klaim "10 menit ke stasiun". Kami menghitung estimasi waktu tempuh saat puncak jam 07.00–08.30 WIB ketika semua orang berangkat kantor.</p>
              <div style={{ background: "#f0f5f2", padding: "14px", borderRadius: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#00684a", fontFamily: "DM Mono" }}>1.8x Lebih Lama</div>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>Rata-rata waktu tempuh jam sibuk vs jalan lengang</span>
              </div>
            </div>

            <div className="v3-bento-card full">
              <span className="v3-bento-tag">Panduan Lapangan</span>
              <h3>Contekan Investigasi Survei: Rahasia yang Jarang Terbuka</h3>
              <p>Rumper membekali Anda dengan checklist pertanyaan taktis saat mendatangi lokasi rumah. Tanya satpam dan warga warung kopi terdekat dengan pertanyaan yang tepat sebelum menandatangani SPK atau PPJB.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
       * 4. INDEPENDENSI & INTEGRITAS (Trust Pillars - Grupy Security)
       * ───────────────────────────────────────────────────────── */}
      <section className="v3-section v3-trust-wrap" id="integritas">
        <div className="v3-container">
          <div className="v3-head">
            <span className="v3-eyebrow" style={{ color: "#00ed64" }}><span className="v3-eyebrow-dot" /> Independensi & Integritas</span>
            <h2>100% di pihak pembeli rumah. Tanpa kompromi.</h2>
            <p className="lead">Rumper tidak menjual unit rumah, tidak menerima komisi developer, dan tidak bekerja sama dengan agen properti mana pun.</p>
          </div>

          <div className="v3-trust-grid">
            <div className="v3-trust-card">
              <div className="v3-trust-icon">🛡</div>
              <h3>Tanpa Komisi Developer</h3>
              <p>Setiap skor murni dihitung dari algoritma risiko spasial. Tidak ada titipan sponsor atau iklan tersembunyi.</p>
            </div>
            <div className="v3-trust-card">
              <div className="v3-trust-icon">📊</div>
              <h3>4 Sumber Data Resmi</h3>
              <p>InaRISK BNPB untuk kebencanaan, Badan Informasi Geospasial (BIG), Google Routes, dan pemetaan fasilitas sekitar (OpenStreetMap).</p>
            </div>
            <div className="v3-trust-card">
              <div className="v3-trust-icon">⚡</div>
              <h3>Prinsip No Data != Low Risk</h3>
              <p>Jika data pada titik tertentu belum lengkap, kami sebut celah bukti, bukan memberi rasa aman semu.</p>
            </div>
            <div className="v3-trust-card">
              <div className="v3-trust-icon">🔍</div>
              <h3>Panduan Lapangan Nyata</h3>
              <p>Dilengkapi checklist investigasi fisik agar Anda tahu persis apa yang perlu diperiksa sebelum mentransfer uang tanda jadi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
       * 5. HARGA TRANSPARAN (Pricing Table)
       * ───────────────────────────────────────────────────────── */}
      <section className="v3-section" id="harga">
        <div className="v3-container">
          <div className="v3-head">
            <span className="v3-eyebrow"><span className="v3-eyebrow-dot" /> Harga Transparan</span>
            <h2>Investasi kecil sebelum komitmen ratusan juta.</h2>
            <p className="lead">Biaya audit lokasi Rumper tidak sampai 0.01% dari nilai booking fee rumah incaran Anda.</p>
          </div>

          <div className="v3-pricing-grid">
            {/* Tier 1 */}
            <div className="v3-price-card">
              <h3 className="v3-price-name">Cek Awal</h3>
              <p className="v3-price-desc">Untuk melihat apakah perumahan incaran layak diperiksa lebih lanjut.</p>
              <div className="v3-price-val">Rp0 <span>/ lokasi</span></div>
              <ul className="v3-price-features">
                <li><svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" clipRule="evenodd" /></svg> 1 Pengecekan lokasi awal</li>
                <li><svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" clipRule="evenodd" /></svg> Sinyal keselamatan utama</li>
                <li><svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" clipRule="evenodd" /></svg> Ringkasan 5 faktor lokasi</li>
              </ul>
              <a className="btn" style={{ background: "#f0f4f6", color: "var(--ink)", width: "100%" }} href="/app/start">Mulai Gratis</a>
            </div>

            {/* Tier 2 */}
            <div className="v3-price-card featured">
              <span className="v3-price-badge">Paling Populer</span>
              <h3 className="v3-price-name">Laporan Lengkap</h3>
              <p className="v3-price-desc">Untuk properti yang sudah masuk shortlist serius sebelum bayar DP.</p>
              <div className="v3-price-val">Rp49.000 <span>/ laporan</span></div>
              <ul className="v3-price-features">
                <li><svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" clipRule="evenodd" /></svg> Laporan audit 5 dimensi mendalam</li>
                <li><svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" clipRule="evenodd" /></svg> Tingkat bukti resmi (Confidence Level)</li>
                <li><svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" clipRule="evenodd" /></svg> Panduan survei satpam & warga</li>
                <li><svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" clipRule="evenodd" /></svg> Checklist pasca-kunjungan fisik</li>
              </ul>
              <a className="btn btn-accent" style={{ width: "100%" }} href="/app/start?plan=lengkap">Cek Lokasi Lengkap →</a>
            </div>

            {/* Tier 3 */}
            <div className="v3-price-card">
              <h3 className="v3-price-name">Akses 30 Hari</h3>
              <p className="v3-price-desc">Untuk masa pencarian aktif dan perbandingan beberapa rumah sekaligus.</p>
              <div className="v3-price-val">Rp149.000 <span>/ 30 hari</span></div>
              <ul className="v3-price-features">
                <li><svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" clipRule="evenodd" /></svg> Pengecekan multi-lokasi tanpa batas</li>
                <li><svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" clipRule="evenodd" /></svg> Bandingkan 2–4 koridor berdampingan</li>
                <li><svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" clipRule="evenodd" /></svg> Unduh laporan PDF untuk keluarga</li>
              </ul>
              <a className="btn" style={{ background: "#f0f4f6", color: "var(--ink)", width: "100%" }} href="/app/start?plan=30hari">Pilih Akses 30 Hari →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
       * 6. FAQ (Accordion)
       * ───────────────────────────────────────────────────────── */}
      <section className="v3-section" id="faq" style={{ background: "#f8faf8" }}>
        <div className="v3-container">
          <div className="v3-head">
            <span className="v3-eyebrow"><span className="v3-eyebrow-dot" /> FAQ</span>
            <h2>Pertanyaan yang sering muncul</h2>
            <p className="lead">Masih ada yang membuat Anda ragu? Hubungi kami langsung di <a href="mailto:halo@rumper.id" style={{ color: "#00875a", fontWeight: "700" }}>halo@rumper.id</a>.</p>
          </div>

          <div className="v3-faq-list">
            <details className="v3-faq-item" open>
              <summary className="v3-faq-summary">
                <span>Apakah Rumper terafiliasi dengan developer perumahan tertentu?</span>
                <span className="v3-faq-icon">+</span>
              </summary>
              <div className="v3-faq-content">
                Tidak sama sekali. Rumper 100% independen dan didanai oleh biaya audit pengguna, bukan oleh komisi developer. Kami tidak menjual unit rumah sehingga hasil analisis murni objektif.
              </div>
            </details>

            <details className="v3-faq-item">
              <summary className="v3-faq-summary">
                <span>Dari mana Rumper mendapatkan data risiko banjir?</span>
                <span className="v3-faq-icon">+</span>
              </summary>
              <div className="v3-faq-content">
                Kami mengintegrasikan peta kerawanan bencana InaRISK dari Badan Nasional Penanggulangan Bencana (BNPB), kontur elevasi tanah BIG, serta data riwayat genangan lokal di sekitar koordinat rumah incaran Anda.
              </div>
            </details>

            <details className="v3-faq-item">
              <summary className="v3-faq-summary">
                <span>Kapan waktu paling tepat menggunakan Rumper?</span>
                <span className="v3-faq-icon">+</span>
              </summary>
              <div className="v3-faq-content">
                Sebelum Anda mentransfer biaya booking fee atau uang muka (DP). Begitu Anda menemukan rumah yang menarik di portal properti atau brosur marketing, cek terlebih dahulu di Rumper sebelum survei fisik ke lapangan.
              </div>
            </details>

            <details className="v3-faq-item">
              <summary className="v3-faq-summary">
                <span>Bagaimana jika perumahan yang saya cari masih sangat baru?</span>
                <span className="v3-faq-icon">+</span>
              </summary>
              <div className="v3-faq-content">
                Sistem kami menganalisis berdasarkan titik koordinat geografis di peta, bukan sekadar nama proyek. Meskipun nama cluster baru dibangun, kondisi kontur tanah, jalur SUTET, dan batas wilayah sekitarnya tetap dapat dianalisis secara akurat.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
       * 7. FINAL CTA & FOOTER
       * ───────────────────────────────────────────────────────── */}
      <section className="v3-final-wrap">
        <div className="v3-container">
          <div className="v3-final-box">
            <h2>Jangan baru tahu setelah bayar DP.</h2>
            <p>Satu keputusan cerdas hari ini melindungi tabungan, kenyamanan keluarga, dan masa depan Anda hingga puluhan tahun ke depan.</p>
            <a className="btn btn-accent" style={{ padding: "14px 32px", fontSize: "16px" }} href="/app/start">
              Cek Rumah Incaran Sekarang <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="v3-footer">
        <div className="v3-footer-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "800", color: "var(--ink)" }}>
            <span style={{ color: "#00ed64" }}>◉</span> Rumper
          </div>
          <div>© 2026 Rumper. Location intelligence for considered property decisions.</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            <a href="#cara-kerja" style={{ color: "var(--muted)", textDecoration: "none" }}>Cara Kerja</a>
            <a href="#harga" style={{ color: "var(--muted)", textDecoration: "none" }}>Harga</a>
            <a href="/terms" style={{ color: "var(--muted)", textDecoration: "none" }}>Syarat Layanan</a>
            <a href="/privacy" style={{ color: "var(--muted)", textDecoration: "none" }}>Kebijakan Privasi</a>
            <a href="/security" style={{ color: "var(--muted)", textDecoration: "none" }}>Keamanan</a>
            <a href="mailto:halo@rumper.id" style={{ color: "var(--muted)", textDecoration: "none" }}>Kontak</a>
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────
       * MOBILE STICKY CTA BAR (Grupy Signature Pattern)
       * ───────────────────────────────────────────────────────── */}
      <aside className={`v3-sticky-bar ${showStickyCta ? "is-visible" : ""}`} aria-label="Ajakan cek lokasi rumah">
        <div className="v3-sticky-text">
          <strong>Sudah suka rumahnya?</strong>
          <span>Cek risiko lokasinya gratis</span>
        </div>
        <a className="btn btn-accent" style={{ padding: "8px 16px", fontSize: "13px" }} href="/app/start">
          Cek Lokasi →
        </a>
      </aside>
    </div>
  );
}
