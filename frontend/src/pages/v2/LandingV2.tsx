// @ts-nocheck
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import KineticGrid from "@/components/ui/kinetic-grid";
import FrequentlyAskedQuestions from "@/components/ui/frequently-asked-questions-with-accordion";
import mascotRumper from "@/assets/mascott-rumper.webp";
import surveyRiskMapImg from "@/assets/landing/survey-risk-map.jpg";
import "./LandingV2.css";

const NAV_HTML = `<div class="nav-wrap" id="navWrap">
    <div class="nav-backdrop" id="navBackdrop" aria-hidden="true"></div>
    <nav class="nav" id="mainNav">
      <div class="nav-header">
        <a class="brand" href="#top" aria-label="Rumper">
          <span class="brandmark" aria-hidden="true">
            <svg viewBox="0 0 30 30" fill="none">
              <path d="M15.0515 3.50391H15.0457L15.0964 3.51953C15.1082 3.52428 15.1192 3.52992 15.1297 3.53613L15.2 3.59082L15.5066 3.85254L15.5115 3.85742L15.5173 3.8623C18.2257 6.10888 21.6488 7.31502 25.1687 7.26367H25.1824L25.6111 7.25098H25.6277C25.6841 7.24842 25.7399 7.26413 25.7859 7.29688C25.8328 7.33035 25.8653 7.37786 25.8806 7.42969C26.4577 9.39036 26.6346 11.4474 26.4002 13.4775C26.1657 15.5077 25.5252 17.4709 24.5164 19.249C23.5076 21.0269 22.1498 22.5847 20.5261 23.8291C18.9026 25.0732 17.045 25.979 15.0642 26.4922C15.023 26.5028 14.979 26.503 14.9373 26.4922C12.9562 25.9791 11.098 25.0732 9.47438 23.8291C7.85076 22.5849 6.49416 21.0263 5.48512 19.248C4.47617 17.4699 3.83483 15.5075 3.60036 13.4775C3.36592 11.4474 3.5428 9.39042 4.11989 7.42969C4.13523 7.3778 4.16773 7.33032 4.21461 7.29688C4.26065 7.26408 4.31647 7.24842 4.37282 7.25098C8.04755 7.41871 11.6533 6.20992 14.4832 3.8623L14.489 3.85742L14.4949 3.85156L14.8054 3.58496L14.867 3.53711C14.8787 3.52979 14.8907 3.52431 14.9021 3.51953L14.95 3.50488C14.9518 3.50455 14.9538 3.50422 14.9558 3.50391L14.9998 3.50098L15.0515 3.50391Z" stroke="#00ED64" stroke-width="2"/>
              <path d="M19.2424 9.80155C20.344 10.9307 20.974 12.4547 20.9992 14.0514C21.0245 15.648 20.443 17.1922 19.3778 18.3573L19.2424 18.5009L16.4138 21.3999C16.0549 21.7677 15.5731 21.9818 15.066 21.9989C14.5588 22.016 14.0643 21.8349 13.6826 21.4922L13.5866 21.3999L10.7573 18.5002C9.63213 17.3467 9 15.7822 9 14.1509C9 12.5196 9.63213 10.9551 10.7573 9.80155C11.8825 8.64804 13.4086 8 14.9999 8C16.5911 8 18.1172 8.64804 19.2424 9.80155ZM14.9999 12.1006C14.7372 12.1006 14.4772 12.1536 14.2345 12.2567C13.9919 12.3597 13.7714 12.5107 13.5857 12.7011C13.4 12.8915 13.2527 13.1175 13.1522 13.3663C13.0517 13.615 12.9999 13.8816 12.9999 14.1509C12.9999 14.4201 13.0517 14.6867 13.1522 14.9355C13.2527 15.1842 13.4 15.4102 13.5857 15.6006C13.7714 15.791 13.9919 15.942 14.2345 16.0451C14.4772 16.1481 14.7372 16.2011 14.9999 16.2011C15.5303 16.2011 16.039 15.9851 16.4141 15.6006C16.7891 15.2161 16.9998 14.6946 16.9998 14.1509C16.9998 13.6071 16.7891 13.0856 16.4141 12.7011C16.039 12.3166 15.5303 12.1006 14.9999 12.1006Z" fill="#5085FF"/>
            </svg>
          </span>
          Rumper
        </a>
        <div class="nav-links">
          <a href="#cara-kerja">Cara Kerja</a>
          <a href="#yang-dicek">Fitur</a>
          <a href="#contoh">Contoh Laporan</a>
          <a href="#harga">Harga</a>
          <a href="#faq">FAQ</a>
        </div>
        <div class="nav-actions">
          <a class="btn btn-accent btn-nav-login" href="/login">Masuk</a>
          <button class="btn-nav-more" id="navMenuBtn" type="button" aria-label="Buka menu navigasi" aria-expanded="false" aria-controls="navExpandedBody">
            <svg class="icon-bars" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="7" x2="21" y2="7"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="17" x2="21" y2="17"></line>
            </svg>
            <svg class="icon-close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="nav-expanded-body" id="navExpandedBody" aria-hidden="true">
        <div class="nav-expanded-scroll">
          <nav class="mobile-menu-nav">
            <a href="#cara-kerja" class="mobile-nav-item">
              <span class="mobile-nav-title">Cara Kerja</span>
              <span class="mobile-nav-arrow" aria-hidden="true">→</span>
            </a>
            <a href="#yang-dicek" class="mobile-nav-item">
              <span class="mobile-nav-title">
                Fitur
                <span class="mobile-nav-badge">Audit</span>
              </span>
              <span class="mobile-nav-arrow" aria-hidden="true">→</span>
            </a>
            <a href="#contoh" class="mobile-nav-item">
              <span class="mobile-nav-title">Contoh Laporan</span>
              <span class="mobile-nav-arrow" aria-hidden="true">→</span>
            </a>
            <a href="#harga" class="mobile-nav-item">
              <span class="mobile-nav-title">Harga</span>
              <span class="mobile-nav-arrow" aria-hidden="true">→</span>
            </a>
            <a href="#faq" class="mobile-nav-item">
              <span class="mobile-nav-title">FAQ</span>
              <span class="mobile-nav-arrow" aria-hidden="true">→</span>
            </a>
          </nav>

          <div class="mobile-menu-bottom">
            <div class="mobile-mascot-dock">
              <div class="mobile-mascot-speech">
                <span>Cek risiko lokasi sebelum bayar DP!</span>
                <span class="speech-tail" aria-hidden="true"></span>
              </div>
              <div class="mobile-mascot-avatar-wrap">
                <div class="mobile-mascot-glow" aria-hidden="true"></div>
                <img src="${mascotRumper}" alt="Maskot Rumper" class="mobile-mascot-img" width="138" height="138" />
              </div>
            </div>
            <div class="mobile-menu-actions">
              <a href="/login" class="mobile-menu-btn mobile-menu-btn-secondary">Masuk</a>
              <a href="#heroSearch" class="mobile-menu-btn mobile-menu-btn-primary">
                <span>Coba Cek Lokasi Sekarang</span>
                <span class="arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>`;


const HERO_INNER_HTML = `<div class="hero-centered reveal">

        <a href="/app/start" class="pill" aria-label="Audit risiko lokasi sebelum DP - Jabodetabek">
          <svg class="pill-pin" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00ED64" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>Audit Risiko Lokasi Sebelum DP · Jabodetabek</span>
          <span class="pill-arrow-btn" aria-hidden="true">→</span>
        </a>

        <h1>Sudah suka rumahnya?<br><span class="accent">Cek dulu risiko lokasinya.</span></h1>
        <p class="lead">Verifikasi riwayat banjir, macet jam kerja, dan perimeter aman sebelum bayar tanda jadi atau DP.</p>

        <form class="search-box" id="heroSearch" onsubmit="return false;">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z"/>
            <path d="M9 21V12h6v9"/>
          </svg>
          <input aria-label="Alamat atau nama perumahan" placeholder="Contoh: Grand Galaxy Bekasi" />
          <button class="btn btn-accent" type="submit">Cek Lokasi <span class="arrow">→</span></button>
        </form>

        <div class="hero-micro">
          <span>
            <svg class="micro-check" viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="9" fill="rgba(0,237,100,0.15)" stroke="#00ED64" stroke-width="1.5"/>
              <path d="m6.5 10 2.5 2.5 5-5" stroke="#00ED64" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            4 Sumber geospasial resmi
          </span>
          <span>
            <svg class="micro-check" viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="9" fill="rgba(0,237,100,0.15)" stroke="#00ED64" stroke-width="1.5"/>
              <path d="m6.5 10 2.5 2.5 5-5" stroke="#00ED64" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            100% Independen tanpa komisi
          </span>
          <span>
            <svg class="micro-check" viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="9" fill="rgba(0,237,100,0.15)" stroke="#00ED64" stroke-width="1.5"/>
              <path d="m6.5 10 2.5 2.5 5-5" stroke="#00ED64" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            1 Cek lokasi awal gratis
          </span>
        </div>

        <div class="hero-card-stage" aria-label="Contoh tampilan laporan Rumper">
          <div class="card-stack" id="heroCardStack" aria-expanded="false" role="group" aria-label="Pilihan contoh laporan lokasi">
            <div class="report-tabs" id="cardStackTabs">
              <button class="mini-tab active" data-id="0" aria-label="Tampilkan laporan Grand Galaxy City">Grand Galaxy</button>
              <button class="mini-tab" data-id="1" aria-label="Tampilkan laporan Kota Wisata">Kota Wisata</button>
              <button class="mini-tab" data-id="2" aria-label="Tampilkan laporan BSD City">BSD City</button>
              <button class="mini-tab" data-id="3" aria-label="Tampilkan laporan PIK 2">PIK 2</button>
            </div>
            
            <!-- Card 4 (Index 3) -->
            <div class="floating-report stacked" data-id="3" data-order="3" role="button" tabindex="0" aria-label="Tampilkan laporan PIK 2">
              <div class="report-head">
                <div class="report-location">
                  <div class="pin" style="width:36px;height:36px;min-width:36px;min-height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:#ffeaee;color:#d32f2f">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;margin:auto"><path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5Z"/></svg>
                  </div>
                  <div>
                    <strong style="font-size:16px;color:#07263a">PIK 2</strong>
                    <div class="small muted" style="margin-top:2px;font-size:13px">Jakarta Utara</div>
                  </div>
                </div>
                <span class="risk-chip" style="background:#ffeaee;color:#d32f2f">Perlu Validasi</span>
              </div>
              <div class="map">
                <div class="risk-zone" style="left:50%;top:50%;background:radial-gradient(circle at 50% 50%,rgba(211,47,47,.32),transparent 72%);width:180px;height:180px;"></div>
                <div class="property-marker" style="left:50%;top:50%;background:#ef5350;box-shadow:0 0 0 6px rgba(239,83,80,.18);"></div>
              </div>
              <div class="report-row" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0 2px;border-top:none;color:#536b75">
                <div style="font-size:14px">Pesisir rob · Ketergantungan tol</div>
                <div class="report-score">55/100</div>
              </div>
            </div>

            <!-- Card 3 (Index 2) -->
            <div class="floating-report stacked" data-id="2" data-order="2" role="button" tabindex="0" aria-label="Tampilkan laporan BSD City">
              <div class="report-head">
                <div class="report-location">
                  <div class="pin" style="width:36px;height:36px;min-width:36px;min-height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:#eaf5ef;color:#00684a">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;margin:auto"><path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5Z"/></svg>
                  </div>
                  <div>
                    <strong style="font-size:16px;color:#07263a">BSD City</strong>
                    <div class="small muted" style="margin-top:2px;font-size:13px">Tangerang Selatan</div>
                  </div>
                </div>
                <span class="risk-chip" style="background:#eaf5ef;color:#00684a">Sangat Selaras</span>
              </div>
              <div class="map">
                <div class="property-marker" style="left:50%;top:50%;background:var(--accent);box-shadow:0 0 0 6px rgba(0,237,100,.18);"></div>
              </div>
              <div class="report-row" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0 2px;border-top:none;color:#536b75">
                <div style="font-size:14px">Fasilitas lengkap · Bebas SUTET</div>
                <div class="report-score">94/100</div>
              </div>
            </div>

            <!-- Card 2 (Index 1) -->
            <div class="floating-report stacked" data-id="1" data-order="1" role="button" tabindex="0" aria-label="Tampilkan laporan Kota Wisata">
              <div class="report-head">
                <div class="report-location">
                  <div class="pin" style="width:36px;height:36px;min-width:36px;min-height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:#fff8e0;color:#d79a2b">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;margin:auto"><path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5Z"/></svg>
                  </div>
                  <div>
                    <strong style="font-size:16px;color:#07263a">Kota Wisata</strong>
                    <div class="small muted" style="margin-top:2px;font-size:13px">Cibubur</div>
                  </div>
                </div>
                <span class="risk-chip" style="background:#fff8e0;color:#d79a2b">Risiko Rendah–Sedang</span>
              </div>
              <div class="map">
                <div class="risk-zone" style="left:60%;top:20%;background:radial-gradient(circle at 45% 50%,rgba(215,154,43,.32),transparent 72%)"></div>
                <div class="property-marker" style="left:40%;top:60%;background:#f5b73b;box-shadow:0 0 0 6px rgba(245,183,59,.18);"></div>
              </div>
              <div class="report-row" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0 2px;border-top:none;color:#536b75">
                <div style="font-size:14px">1 temuan mobilitas jam sibuk</div>
                <div class="report-score">82/100</div>
              </div>
            </div>

            <!-- Card 1 (Index 0) -->
            <div class="floating-report stacked" data-id="0" data-order="0" role="button" tabindex="0" aria-label="Tampilkan laporan Grand Galaxy City">
              <div class="report-head">
                <div class="report-location">
                  <div class="pin" style="width:36px;height:36px;min-width:36px;min-height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:#eaf5ef;color:#00684a">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;margin:auto"><path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5Z"/></svg>
                  </div>
                  <div>
                    <strong style="font-size:16px;color:#07263a">Grand Galaxy City</strong>
                    <div class="small muted" style="margin-top:2px;font-size:13px">Bekasi Selatan</div>
                  </div>
                </div>
                <span class="risk-chip">Risiko Sedang–Tinggi</span>
              </div>
              <div class="map">
                <div class="risk-zone"></div>
                <div class="property-marker"></div>
              </div>
              <div class="report-row" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0 2px;border-top:none;color:#536b75">
                <div style="font-size:14px">3 temuan perlu divalidasi</div>
                <div class="report-score">68/100</div>
              </div>
            </div>
          </div>
          <div class="stage-label">Contoh visual · data ilustratif untuk prototype</div>
        </div>
      </div>`;

const MAIN_PRE_FAQ_HTML = `<section class="section" id="cara-kerja">

      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow"><span class="eyebrow-dot"></span> Cara kerja</span>
          <h2>Dari rumah incaran menjadi keputusan yang lebih yakin.</h2>
          <p class="lead" style="margin-inline:auto">Rumper membantu Anda bergerak dari alamat → bukti → pemahaman → tindakan, tanpa harus mengerti GIS atau membaca dataset mentah.</p>
        </div>

        <div class="journey reveal" id="journey">
          <article class="journey-card active" data-step="0" role="button" tabindex="0" aria-pressed="true" aria-label="Langkah 1: Cari lokasi rumah incaran">
            <div class="journey-card-body">
              <span class="journey-num">01</span>
              <h3>Cari Lokasi</h3>
              <p>Ketik nama perumahan, cluster, atau pin alamat rumah incaranmu di Jabodetabek.</p>
            </div>
            <div class="journey-ui">
              <div class="journey-search">
                <div class="journey-search-main">
                  <div class="pin" style="width:32px;height:32px;background:#eaf5ef;color:#00684a;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5Z"/></svg>
                  </div>
                  <div style="flex:1;min-width:0">
                    <b style="display:block;font-size:13px;color:#07263a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Grand Galaxy City</b>
                    <span style="font-size:12px;color:var(--muted)">Bekasi Selatan</span>
                  </div>
                </div>
                <div class="journey-search-meta">
                  <span class="journey-badge-verified">Radius pantau 3 km</span>
                  <span style="font-size:11px;color:#00684a;font-weight:600">✓ Titik terverifikasi</span>
                </div>
              </div>
            </div>
          </article>

          <article class="journey-card" data-step="1" role="button" tabindex="0" aria-pressed="false" aria-label="Langkah 2: Pindai 5 faktor lingkungan">
            <div class="journey-card-body">
              <span class="journey-num">02</span>
              <h3>Pindai Lingkungan</h3>
              <p>Rumper menyatukan data resmi kebencanaan, batas zonasi wilayah, simulasi macet rute kerja, dan fasilitas umum.</p>
            </div>
            <div class="journey-ui">
              <div class="journey-header-label">5 Cek Utama Lingkungan</div>
              <div class="journey-chips-grid">
                <span class="journey-chip"><span class="chip-dot">✓</span> Riwayat & potensi banjir</span>
                <span class="journey-chip"><span class="chip-dot">✓</span> Akses jalan & zonasi resmi</span>
                <span class="journey-chip"><span class="chip-dot">✓</span> Simulasi macet jam kerja</span>
                <span class="journey-chip"><span class="chip-dot">✓</span> Sekolah, RS, & pasar</span>
                <span class="journey-chip"><span class="chip-dot">✓</span> Jarak SUTET & limbah</span>
              </div>
            </div>
          </article>

          <article class="journey-card" data-step="2" role="button" tabindex="0" aria-pressed="false" aria-label="Langkah 3: Pahami bukti dan skor risiko">
            <div class="journey-card-body">
              <span class="journey-num">03</span>
              <h3>Pahami Risiko</h3>
              <p>Laporan disajikan transparan dalam bahasa awam dengan skor risiko dan bukti riwayat lapangan yang jelas.</p>
            </div>
            <div class="journey-ui">
              <div class="journey-evidence-card">
                <div class="journey-evidence-top">
                  <span class="journey-alert-badge">⚠ Potensi Genangan Air</span>
                  <span class="journey-score-mini">Skor 68/100</span>
                </div>
                <div class="journey-evidence-detail">
                  <span class="journey-conf">Tingkat bukti: <b>Tinggi</b></span>
                  <span class="journey-subnote">Kontur tanah cekung saat hujan lebat</span>
                </div>
              </div>
            </div>
          </article>

          <article class="journey-card" data-step="3" role="button" tabindex="0" aria-pressed="false" aria-label="Langkah 4: Bawa panduan cek di lokasi">
            <div class="journey-card-body">
              <span class="journey-num">04</span>
              <h3>Siap Survei</h3>
              <p>Bawa contekan pertanyaan taktis untuk satpam, warga sekitar, dan developer agar tidak terjebak janji manis brosur.</p>
            </div>
            <div class="journey-ui">
              <div class="journey-header-label">Panduan Cek di Lokasi</div>
              <div class="journey-checklist">
                <div class="journey-check-item"><span class="check-icon">✓</span> Intip bekas garis air di pos satpam</div>
                <div class="journey-check-item"><span class="check-icon">✓</span> Uji rute gerbang saat jam sibuk pagi</div>
                <div class="journey-check-item"><span class="check-icon">✓</span> Cek jarak tiang listrik & kabel SUTET</div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section showcase-section" id="eksplorasi">
      <div class="container">
        <div class="showcase-shell reveal" id="showcaseShell" data-theme="flood">
          <div class="showcase-title">
            <span class="eyebrow">Eksplorasi 5 Faktor Lokasi</span>
            <h2 style="font-size:clamp(40px,4vw,64px)">Apa yang perlu dicek sebelum keluar uang?</h2>
          </div>

          <div class="showcase-tabs" role="tablist" aria-label="Kategori risiko">
            <button class="show-tab active" data-theme="flood" role="tab">Ketahanan Banjir</button>
            <button class="show-tab" data-theme="commute" role="tab">Efisiensi Commute</button>
            <button class="show-tab" data-theme="access" role="tab">Akses Fisik</button>
            <button class="show-tab" data-theme="facilities" role="tab">Fasilitas Esensial</button>
            <button class="show-tab" data-theme="environment" role="tab">Lingkungan & Red Flag</button>
          </div>

          <div class="show-card" id="showCard">
            <div class="show-copy">
              <span class="pill" id="showPill">Ketahanan Banjir</span>
              <h3 id="showTitle">Jangan percaya klaim verbal 100% bebas banjir.</h3>
              <p id="showBody">Rumper mencocokkan titik lokasi dengan batas kerawanan InaRISK BNPB dan analisis kontur elevasi tanah untuk mendeteksi potensi genangan musiman.</p>
              <a class="link" href="#transparansi" style="font-weight:760;display:inline-flex;align-items:center;gap:8px">Lihat bukti lokasi <span class="arrow">→</span></a>
            </div>
            <div class="show-visual">
              <div class="mini-map">
                <div class="road r1"></div><div class="road r2"></div>
                <div class="halo" id="showHalo"></div>
                <div class="home-dot"></div>
                <div class="metric-card">
                  <div><strong id="metricLabel">Zona InaRISK</strong><br><span id="metricSub">posisi tanah relatif rendah</span></div>
                  <div class="metric-number" id="metricNumber">Zona Sedang</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section trust-section" id="integritas">
      <div class="container">
        <div class="section-head reveal" style="text-align:center;max-width:820px;margin:0 auto 52px">
          <span class="eyebrow" style="color:#00ed64"><span class="eyebrow-dot"></span> Independensi & Integritas</span>
          <h2 style="color:#ffffff">100% di pihak pembeli rumah.<br>Tanpa kompromi.</h2>
          <p class="lead" style="color:rgba(255,255,255,0.72)">Rumper tidak menjual unit rumah, tidak menerima komisi developer, dan tidak bekerja sama dengan agen properti mana pun.</p>
        </div>

        <div class="trust-grid reveal">
          <div class="trust-card">
            <div class="trust-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <h3>Tanpa Komisi Developer</h3>
            <p>Setiap skor murni dihitung dari algoritma risiko spasial. Tidak ada titipan sponsor atau iklan tersembunyi.</p>
          </div>

          <div class="trust-card">
            <div class="trust-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-column">
                <path d="M3 3v16a2 2 0 0 0 2 2h16"/>
                <path d="M18 17V9"/>
                <path d="M13 17V5"/>
                <path d="M8 17v-3"/>
              </svg>
            </div>
            <h3>4 Sumber Data Resmi</h3>
            <p>InaRISK BNPB untuk kebencanaan, Badan Informasi Geospasial (BIG), Google Routes, dan pemetaan fasilitas sekitar (OpenStreetMap).</p>
          </div>

          <div class="trust-card">
            <div class="trust-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap">
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
              </svg>
            </div>
            <h3>Prinsip No Data != Low Risk</h3>
            <p>Jika data pada titik tertentu belum lengkap, kami sebut celah bukti, bukan memberi rasa aman semu.</p>
          </div>

          <div class="trust-card">
            <div class="trust-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
            <h3>Panduan Lapangan Nyata</h3>
            <p>Dilengkapi checklist investigasi fisik agar Anda tahu persis apa yang perlu diperiksa sebelum mentransfer uang tanda jadi.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="yang-dicek">
      <div class="container split">
        <div class="reveal">
          <h2 class="risk-section-title">Yang tidak selalu terlihat<br>saat survei rumah.</h2>

          <div class="accordion" id="accordion">
            <button class="acc active" data-acc="0">
              <div class="acc-head"><span>Ketahanan banjir & elevasi</span><span>↗</span></div>
              <p>Potensi genangan, batas kerawanan InaRISK BNPB, dan analisis kontur tanah untuk deteksi cekungan air.</p>
            </button>
            <button class="acc" data-acc="1">
              <div class="acc-head"><span>Efisiensi commute & jam sibuk</span><span>↗</span></div>
              <p>Simulasi rute Google Routes saat jam sibuk (07.00–08.30 WIB) menuju kantor dan stasiun KRL/LRT.</p>
            </button>
            <button class="acc" data-acc="2">
              <div class="acc-head"><span>Akses fisik & jalan</span><span>↗</span></div>
              <p>Konektivitas ke gerbang tol terdekat, lebar jalan lingkungan, dan titik bottleneck keluar-masuk.</p>
            </button>
            <button class="acc" data-acc="3">
              <div class="acc-head"><span>Lingkungan & bahaya fisik</span><span>↗</span></div>
              <p>Jarak aman terhadap menara SUTET (≤250m), tempat pembuangan sampah (TPA ≤1.5km), kawasan industri, dan rel kereta.</p>
            </button>
            <button class="acc" data-acc="4">
              <div class="acc-head"><span>Fasilitas esensial harian</span><span>↗</span></div>
              <p>Akses ke rumah sakit darurat, klinik 24 jam, sekolah, dan pusat belanja kebutuhan pokok dalam radius 3 km.</p>
            </button>
          </div>
        </div>

        <div class="visual-orbit visual-orbit-img-card reveal" id="visualOrbit" data-theme="theme-flood" data-active-index="0">
          <div class="orbit-img-glow" aria-hidden="true"></div>
          <div class="orbit-img-wrapper">
            <img 
              src="${surveyRiskMapImg}" 
              alt="Peta analisis spasial risiko banjir, elevasi, dan rute commute" 
              class="orbit-map-img" 
              width="1024" 
              height="1024"
              loading="lazy"
            />
          </div>
          <div class="orbit-card-caption">
            <span class="orbit-status-dot"></span>
            <span id="gisLayerLabel">Layer: Kontur DEM & BNPB</span>
          </div>
        </div>
      </div>
    </section>

      <!-- Peeking Carousel Section -->
      <section class="feature-carousel-section" id="momen-krusial" aria-label="4 Momen Krusial Menggunakan Rumper">
        <div class="container">
          <div class="section-head reveal">
            <span class="eyebrow"><span class="eyebrow-dot"></span> Momen Krusial</span>
            <h2>Lindungi uang Anda di 4 momen ini.</h2>
            <p class="lead" style="color:rgba(255,255,255,0.7);margin:20px auto 0">Dari pertama kali melihat iklan hingga detik terakhir sebelum transfer booking fee dan DP.</p>
          </div>
        </div>
        
        <div class="peeking-carousel reveal" id="featureCarousel">
          <!-- Step 1 -->
          <div class="carousel-card active">
            <div class="carousel-card-image">
              <img src="https://images.unsplash.com/photo-1558661091-5cc1b64d0dc5?auto=format&amp;fit=crop&amp;w=1200&amp;q=82" srcset="https://images.unsplash.com/photo-1558661091-5cc1b64d0dc5?auto=format&amp;fit=crop&amp;w=640&amp;q=78 640w, https://images.unsplash.com/photo-1558661091-5cc1b64d0dc5?auto=format&amp;fit=crop&amp;w=1200&amp;q=82 1200w" sizes="(max-width: 768px) 272px, 560px" alt="Rumah modern dengan halaman hijau yang sedang dipertimbangkan pembeli" width="1200" height="800" loading="lazy" decoding="async">
              <span class="photo-context">1. Saat melihat iklan atau brosur perumahan</span>
              <a class="photo-credit" href="https://unsplash.com/photos/6sDuV840wxs" target="_blank" rel="noopener noreferrer" aria-label="Foto rumah oleh Jonathan Borba di Unsplash">Unsplash · Jonathan Borba</a>
            </div>
            <h3>1. Jangan Langsung Telan Klaim Brosur</h3>
            <p>Brosur sales selalu bilang "15 menit ke Jakarta, bebas banjir". Rumper memverifikasi data resmi BNPB dan kontur elevasi tanah sebelum Anda terlanjur jatuh hati.</p>
          </div>
          <!-- Step 2 -->
          <div class="carousel-card">
            <div class="carousel-card-image">
              <img src="https://images.unsplash.com/photo-1640538212466-fd7e9ac47f8b?auto=format&amp;fit=crop&amp;w=1200&amp;q=82" srcset="https://images.unsplash.com/photo-1640538212466-fd7e9ac47f8b?auto=format&amp;fit=crop&amp;w=640&amp;q=78 640w, https://images.unsplash.com/photo-1640538212466-fd7e9ac47f8b?auto=format&amp;fit=crop&amp;w=1200&amp;q=82 1200w" sizes="(max-width: 768px) 272px, 560px" alt="Jalan lingkungan perumahan yang tergenang setelah hujan" width="1200" height="800" loading="lazy" decoding="async">
              <span class="photo-context">2. Sebelum berangkat survei lokasi akhir pekan</span>
              <a class="photo-credit" href="https://unsplash.com/photos/W-snX25xw3s" target="_blank" rel="noopener noreferrer" aria-label="Foto jalan tergenang oleh yusrizal iskadi di Unsplash">Unsplash · yusrizal iskadi</a>
            </div>
            <h3>2. Bawa Contekan Investigasi Lapangan</h3>
            <p>Survei saat cuaca cerah sering menipu. Rumper membekali Anda daftar pertanyaan konfirmasi untuk satpam dan warga: riwayat pompa air, titik genangan akses, dan jam macet terparah.</p>
          </div>
          <!-- Step 3 -->
          <div class="carousel-card">
            <div class="carousel-card-image" style="background:linear-gradient(135deg,#eaf5ef 0%,#d2fae5 100%);flex-direction:column;gap:12px;justify-content:center">
              <div class="report-score" style="font-size:76px;line-height:1;color:#00684a">82<span style="font-size:24px;color:#536b75">/100</span></div>
              <span style="font-weight:700;color:#00684a;background:#fff;padding:6px 16px;border-radius:99px;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,0.06)">Bukti Netral & Mandiri</span>
              <span class="photo-context" style="position:absolute;bottom:16px;left:16px">3. Diskusi penentuan bersama pasangan atau keluarga</span>
            </div>
            <h3>3. Putuskan Berdasarkan Data, Bukan Emosi</h3>
            <p>Punya data terverifikasi untuk menyamakan pandangan dengan pasangan atau orang tua tanpa debat spekulasi yang melelahkan. Keputusan diambil bersama secara rasional.</p>
          </div>
          <!-- Step 4 -->
          <div class="carousel-card">
            <div class="carousel-card-image">
              <img src="https://images.unsplash.com/photo-1758523671285-9ff3f4e0ff38?auto=format&amp;fit=crop&amp;w=1200&amp;q=82" srcset="https://images.unsplash.com/photo-1758523671285-9ff3f4e0ff38?auto=format&amp;fit=crop&amp;w=640&amp;q=78 640w, https://images.unsplash.com/photo-1758523671285-9ff3f4e0ff38?auto=format&amp;fit=crop&amp;w=1200&amp;q=82 1200w" sizes="(max-width: 768px) 272px, 560px" alt="Pasangan menerima kunci rumah baru mereka" width="1200" height="800" loading="lazy" decoding="async">
              <span class="photo-context">4. Detik terakhir sebelum transfer booking fee & DP</span>
              <a class="photo-credit" href="https://unsplash.com/photos/x8l4lN6-xd0" target="_blank" rel="noopener noreferrer" aria-label="Foto pasangan oleh Vitaly Gariev di Unsplash">Unsplash · Vitaly Gariev</a>
            </div>
            <h3>4. Bayar Booking Fee & DP dengan Tenang</h3>
            <p>Uang booking fee tidak mudah ditarik kembali. Pastikan tidak ada bahaya tersembunyi (radius SUTET, TPA sampah, atau akses buntu) sebelum komitmen finansial Anda keluar.</p>
          </div>
        </div>

        <!-- Carousel Indicators / Mobile Pagination Dots & Controls -->
        <div class="carousel-nav-wrap" id="carouselNavWrap" aria-label="Navigasi langkah carousel">
          <button class="carousel-nav-btn prev" id="carouselPrevBtn" aria-label="Langkah sebelumnya">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div class="carousel-dots" id="carouselDots" role="tablist" aria-label="Indikator langkah carousel">
            <button class="carousel-dot active" data-index="0" role="tab" aria-selected="true" aria-label="Langkah 1"></button>
            <button class="carousel-dot" data-index="1" role="tab" aria-selected="false" aria-label="Langkah 2"></button>
            <button class="carousel-dot" data-index="2" role="tab" aria-selected="false" aria-label="Langkah 3"></button>
            <button class="carousel-dot" data-index="3" role="tab" aria-selected="false" aria-label="Langkah 4"></button>
          </div>
          <button class="carousel-nav-btn next" id="carouselNextBtn" aria-label="Langkah berikutnya">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </section>
    <section class="section" id="contoh">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow"><span class="eyebrow-dot"></span> Contoh laporan</span>
          <h2>Bukan cuma skor. Tunjukkan apa artinya.</h2>
          <p class="lead" style="margin-inline:auto">Contoh analisis lokasi independen berbasis data spasial resmi dan validasi lapangan aktual.</p>
        </div>

        <div class="story-card reveal">
          <div class="story-map">
            <div class="road r1"></div><div class="road r2"></div>
            <div class="risk-zone" style="left:18%;top:42%;width:300px;height:220px"></div>
            <div class="property-marker" style="left:62%;top:44%"></div>
          </div>
          <div class="story-panel">
            <span class="story-status">Risiko sedang · perlu validasi</span>
            <h3 class="story-title">Grand Galaxy City</h3>
            <p class="muted">Bekasi Selatan · Laporan Lokasi Standar</p>

            <div class="finding">
              <b class="finding-title finding-warning">
                <span class="finding-icon" aria-hidden="true">⚠</span> Potensi genangan akses utama (Tingkat Risiko: Sedang)
              </b>
              <p>Posisi tanah relatif rendah dekat cekungan sungai. Perlu cek langsung pompa air klaster & riwayat genangan warga sebelum booking.</p>
            </div>
            <div class="finding">
              <b class="finding-title finding-positive">
                <span class="finding-icon" aria-hidden="true">✓</span> Di luar radius bahaya fisik lingkungan (Perimeter terverifikasi)
              </b>
              <p>Jalur transmisi SUTET terdekat &gt;550 m (standar regulasi &gt;250 m) dan TPA Sumurbatu &gt;8 km.</p>
            </div>
            <div class="finding">
              <b class="finding-title finding-neutral">
                <span class="finding-icon" aria-hidden="true">◉</span> Rasio kemacetan komuter 1.6x saat jam sibuk
              </b>
              <p>Simulasi waktu tempuh ke Tol Bekasi Barat ±28 mnt (puncak pagi 07.30 WIB) vs ±17 mnt (kondisi lancar).</p>
            </div>
            <div style="margin-top:auto;padding-top:22px">
              <a class="btn btn-accent" href="#cek">Coba dengan lokasi Anda <span class="arrow">→</span></a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="bandingkan">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow"><span class="eyebrow-dot"></span> Bandingkan</span>
          <h2>Masih pilih antara dua koridor wilayah?</h2>
          <p class="lead" style="margin-inline:auto">Bandingkan 5 faktor lokasi secara berdampingan sebelum menentukan mana yang layak dikunjungi lebih dulu.</p>
        </div>

        <div class="compare-grid reveal">
          <div class="place-card">
            <span class="pill">Koridor A</span>
            <h3 class="place-card-title" style="margin-top:16px">Grand Galaxy City</h3>
            <p class="muted">Bekasi Selatan</p>
            <div class="compare-row"><span>1. Ketahanan Banjir</span><span class="badge-mid">Sedang (Cekungan air)</span></div>
            <div class="compare-row"><span>2. Efisiensi Commute</span><span class="badge-mid">1.6x jam sibuk</span></div>
            <div class="compare-row"><span>3. Akses Fisik</span><span class="badge-low">Tol Bekasi Barat 3.2 km</span></div>
            <div class="compare-row"><span>4. Fasilitas Esensial</span><span class="badge-low">18 Fasilitas dlm 3 km</span></div>
            <div class="compare-row"><span>5. Lingkungan &amp; Red Flag</span><span class="badge-low">Radius aman (&gt;550m SUTET)</span></div>
          </div>
          <div class="place-card">
            <span class="pill">Koridor B</span>
            <h3 class="place-card-title" style="margin-top:16px">Kota Wisata</h3>
            <p class="muted">Cibubur / Gunung Putri</p>
            <div class="compare-row"><span>1. Ketahanan Banjir</span><span class="badge-low">Rendah (Dataran tinggi)</span></div>
            <div class="compare-row"><span>2. Efisiensi Commute</span><span class="badge-mid">1.8x Transyogi</span></div>
            <div class="compare-row"><span>3. Akses Fisik</span><span class="badge-low">Tol Nagrak 1.8 km</span></div>
            <div class="compare-row"><span>4. Fasilitas Esensial</span><span class="badge-low">14 Fasilitas dlm 3 km</span></div>
            <div class="compare-row"><span>5. Lingkungan &amp; Red Flag</span><span class="badge-low">Radius aman (&gt;800m SUTET)</span></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="transparansi">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow"><span class="eyebrow-dot"></span> Transparansi</span>
          <h2>Bukan sekadar angka. Lihat sumber dan tingkat bukti.</h2>
          <p class="lead" style="margin-inline:auto">Setiap temuan dapat ditelusuri kembali ke sumber data spasial resmi, tingkat keyakinan (confidence), dan batasannya.</p>
        </div>

        <div class="source-grid reveal">
          <div class="source-card">
            <div class="source-card-top">
              <div class="source-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers">
                  <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
                  <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
                  <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
                </svg>
              </div>
              <span class="source-badge">4 Dataset Resmi</span>
            </div>
            <h3>Agregasi 4 Data Resmi</h3>
            <p>Bukan opini makelar atau testimoni subjektif. Setiap skor dan temuan lokasi dirajut langsung dari 4 repositori geospasial terakreditasi:</p>
            <div class="source-chips">
              <span class="source-chip"><span class="conf-dot dot-high"></span> <strong>Peta Bencana BNPB:</strong> Zona banjir &amp; potensi genangan</span>
              <span class="source-chip"><span class="conf-dot dot-high"></span> <strong>Kontur Resmi (BIG):</strong> Elevasi tanah &amp; batas wilayah</span>
              <span class="source-chip"><span class="conf-dot dot-high"></span> <strong>Simulasi Waktu Tempuh:</strong> Estimasi macet jam kerja</span>
              <span class="source-chip"><span class="conf-dot dot-high"></span> <strong>Fasilitas Sekitar (OSM):</strong> Akses jalan, sekolah &amp; RS</span>
            </div>
            <div class="source-meta">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Data spasial independen · Tanpa titipan sponsor</span>
            </div>
          </div>

          <div class="source-card">
            <div class="source-card-top">
              <div class="source-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gauge">
                  <path d="m12 14 4-4"/>
                  <path d="M3.34 19a10 10 0 1 1 17.32 0"/>
                </svg>
              </div>
              <span class="source-badge">Derajat Keyakinan</span>
            </div>
            <h3>Tingkat Bukti & Keyakinan</h3>
            <p>Setiap faktor menyertakan derajat kepastian data (confidence score) secara transparan berdasarkan kelengkapan data dan kedekatan sumber resmi:</p>
            <div class="source-chips">
              <span class="source-chip"><span class="conf-dot dot-high"></span> <strong>Data Kuat:</strong> Sumber resmi & data historis lengkap</span>
              <span class="source-chip"><span class="conf-dot dot-mid"></span> <strong>Data Sedang:</strong> Estimasi radius & batas wilayah</span>
              <span class="source-chip"><span class="conf-dot dot-low"></span> <strong>Perlu Validasi:</strong> Butuh konfirmasi fisik saat survei</span>
            </div>
            <div class="source-meta">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Metodologi audit risiko spasial terstandarisasi</span>
            </div>
          </div>

          <div class="source-card">
            <div class="source-card-top">
              <div class="source-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                </svg>
              </div>
              <span class="source-badge badge-warning">Transparansi Penuh</span>
            </div>
            <h3>Evidence Gap (Celah Bukti)</h3>
            <p>Prinsip tegas "No Data != Low Risk". Jika data resmi belum mencakup titik tertentu, Rumper menolak memberi rasa aman palsu kepada pembeli:</p>
            <div class="source-chips">
              <span class="source-chip"><span class="conf-dot dot-warn"></span> <strong>Celah Bukti:</strong> Wilayah minim data publik ditandai jelas</span>
              <span class="source-chip"><span class="conf-dot dot-mid"></span> <strong>Tanya Warga:</strong> Panduan cek ke Ketua RT/RW &amp; tetangga</span>
              <span class="source-chip"><span class="conf-dot dot-high"></span> <strong>Audit Mandiri:</strong> Validasi fisik sebelum transfer DP</span>
            </div>
            <div class="source-meta">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Integritas data di atas klaim marketing semu</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="harga">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow"><span class="eyebrow-dot"></span> HARGA</span>
          <h2>Pilih sesuai fase <br class="pricing-break">pencarian rumah Anda.</h2>
          <p class="lead" style="margin-inline:auto">Mulai dari satu pengecekan, lalu naik ke paket pencarian aktif ketika Anda membandingkan beberapa properti.</p>
        </div>

        <div class="pricing reveal" id="pricingCarousel">
          <div class="price-card" data-index="0">
            <h3>Cek Awal</h3>
            <p class="muted">Untuk melihat apakah lokasi layak diperiksa lebih lanjut.</p>
            <div class="price">Rp0 <small>selamanya</small></div>
            <div class="price-divider"></div>
            <ul>
              <li>1 pengecekan lokasi</li>
              <li>Peringatan keselamatan utama</li>
              <li>Ringkasan faktor lokasi</li>
            </ul>
            <a class="btn btn-ghost" href="/app/start">Mulai gratis</a>
          </div>

          <div class="price-card featured" data-index="1">
            <span class="price-tag">Untuk 1 properti</span>
            <h3>Laporan Lengkap</h3>
            <p class="muted">Untuk properti yang sudah masuk shortlist serius.</p>
            <div class="price">Rp49.000 <small>/ properti</small></div>
            <div class="price-divider"></div>
            <ul>
              <li>Laporan bukti lebih dalam</li>
              <li>Panduan validasi lapangan</li>
              <li>Checklist pasca-kunjungan</li>
            </ul>
            <a class="btn btn-accent" href="/app/start?plan=lengkap">Cek lokasi lengkap <span class="arrow">→</span></a>
          </div>

          <div class="price-card" data-index="2">
            <h3>Akses 30 Hari</h3>
            <p class="muted">Untuk masa pencarian aktif dan perbandingan beberapa rumah.</p>
            <div class="price">Rp129.000 <small>/ 30 hari</small></div>
            <div class="price-divider"></div>
            <ul>
              <li>Hingga 5 properti</li>
              <li>Perbandingan lokasi</li>
              <li>Multi-commute & matriks perbandingan</li>
            </ul>
            <a class="btn btn-ghost" href="/app/start?plan=pass">Pilih pass 30 hari</a>
          </div>
        </div>

        <div class="pricing-dots" id="pricingDots" role="tablist" aria-label="Navigasi paket harga">
          <button class="pricing-dot active" data-index="0" role="tab" aria-selected="true" aria-label="Paket Cek Awal"></button>
          <button class="pricing-dot" data-index="1" role="tab" aria-selected="false" aria-label="Paket Laporan Lengkap"></button>
          <button class="pricing-dot" data-index="2" role="tab" aria-selected="false" aria-label="Paket Akses 30 Hari"></button>
        </div>
      </div>
    </section>`;

const FOOTER_HTML = `<section class="footer-landing-section" id="cek">
      <div class="container">
        <div class="footer-island-card reveal">
          <div class="footer-ambient-glow" aria-hidden="true"></div>

          <!-- Top CTA Row -->
          <div class="footer-cta-row">
            <div class="footer-cta-col-left">
              <div class="footer-cta-badge">
                <span class="eyebrow-dot" aria-hidden="true"></span>
                <span>Mulai dari rumah incaran Anda</span>
              </div>
              <h2 class="footer-cta-heading">
                Khawatir potensi genangan dan macet?<br>
                Biar Rumper bantu verifikasi duluan.
              </h2>
              <p class="footer-cta-subtext">
                Periksa potensi genangan air, kontur elevasi tanah, dan rasio kemacetan jam sibuk sebelum bayar DP.
              </p>

              <!-- Action: Search Box -->
              <form class="search-box footer-search-box" onsubmit="return false;">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2"/>
                  <path d="m16 16 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <input aria-label="Alamat atau nama perumahan" placeholder="Contoh: Grand Galaxy Bekasi atau BSD Serpong" />
                <button class="btn btn-accent" type="submit">Cek Lokasi <span class="arrow">→</span></button>
              </form>
            </div>

            <!-- Right Column: Rumper Mascot with Ambient Glow & Floating Dialogue -->
            <div class="footer-mascot-col">
              <div class="footer-mascot-anchor">
                <div class="footer-speech-bubble">
                  <span>Biar aku yang cek duluan!</span>
                </div>
                <div class="footer-mascot-wrapper">
                  <div class="footer-mascot-glow-ring" aria-hidden="true"></div>
                  <img src="${mascotRumper}" alt="Maskot Rumper" class="footer-mascot-character" width="260" height="260" />
                </div>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="footer-island-divider" aria-hidden="true"></div>

          <!-- Bottom Utility Footer Bar -->
          <div class="footer-utility-row">
            <!-- Brand -->
            <a class="footer-brand" href="#top" aria-label="Kembali ke atas">
              <span class="brandmark" aria-hidden="true">
                <svg viewBox="0 0 30 30" fill="none">
                  <path d="M15.0515 3.50391H15.0457L15.0964 3.51953C15.1082 3.52428 15.1192 3.52992 15.1297 3.53613L15.2 3.59082L15.5066 3.85254L15.5115 3.85742L15.5173 3.8623C18.2257 6.10888 21.6488 7.31502 25.1687 7.26367H25.1824L25.6111 7.25098H25.6277C25.6841 7.24842 25.7399 7.26413 25.7859 7.29688C25.8328 7.33035 25.8653 7.37786 25.8806 7.42969C26.4577 9.39036 26.6346 11.4474 26.4002 13.4775C26.1657 15.5077 25.5252 17.4709 24.5164 19.249C23.5076 21.0269 22.1498 22.5847 20.5261 23.8291C18.9026 25.0732 17.045 25.979 15.0642 26.4922C15.023 26.5028 14.979 26.503 14.9373 26.4922C12.9562 25.9791 11.098 25.0732 9.47438 23.8291C7.85076 22.5849 6.49416 21.0263 5.48512 19.248C4.47617 17.4699 3.83483 15.5075 3.60036 13.4775C3.36592 11.4474 3.5428 9.39042 4.11989 7.42969C4.13523 7.3778 4.16773 7.33032 4.21461 7.29688C4.26065 7.26408 4.31647 7.24842 4.37282 7.25098C8.04755 7.41871 11.6533 6.20992 14.4832 3.8623L14.489 3.85742L14.4949 3.85156L14.8054 3.58496L14.867 3.53711C14.8787 3.52979 14.8907 3.52431 14.9021 3.51953L14.95 3.50488C14.9518 3.50455 14.9538 3.50422 14.9558 3.50391L14.9998 3.50098L15.0515 3.50391Z" stroke="#00ED64" stroke-width="2"/>
                  <path d="M19.2424 9.80155C20.344 10.9307 20.974 12.4547 20.9992 14.0514C21.0245 15.648 20.443 17.1922 19.3778 18.3573L19.2424 18.5009L16.4138 21.3999C16.0549 21.7677 15.5731 21.9818 15.066 21.9989C14.5588 22.016 14.0643 21.8349 13.6826 21.4922L13.5866 21.3999L10.7573 18.5002C9.63213 17.3467 9 15.7822 9 14.1509C9 12.5196 9.63213 10.9551 10.7573 9.80155C11.8825 8.64804 13.4086 8 14.9999 8C16.5911 8 18.1172 8.64804 19.2424 9.80155ZM14.9999 12.1006C14.7372 12.1006 14.4772 12.1536 14.2345 12.2567C13.9919 12.3597 13.7714 12.5107 13.5857 12.7011C13.4 12.8915 13.2527 13.1175 13.1522 13.3663C13.0517 13.615 12.9999 13.8816 12.9999 14.1509C12.9999 14.4201 13.0517 14.6867 13.1522 14.9355C13.2527 15.1842 13.4 15.4102 13.5857 15.6006C13.7714 15.791 13.9919 15.942 14.2345 16.0451C14.4772 16.1481 14.7372 16.2011 14.9999 16.2011C15.5303 16.2011 16.039 15.9851 16.4141 15.6006C16.7891 15.2161 16.9998 14.6946 16.9998 14.1509C16.9998 13.6071 16.7891 13.0856 16.4141 12.7011C16.039 12.3166 15.5303 12.1006 14.9999 12.1006Z" fill="#5085FF"/>
                </svg>
              </span>
              <span class="footer-brand-name">Rumper</span>
            </a>

            <!-- Nav Links: Harga, Syarat Layanan, Kebijakan Privasi, Kontak/WhatsApp -->
            <nav class="footer-nav-links" aria-label="Footer Navigasi">
              <a href="#harga" class="footer-link-item">Harga</a>
              <a href="/terms" class="footer-link-item">Syarat Layanan</a>
              <a href="/privacy" class="footer-link-item">Kebijakan Privasi</a>
              <a href="/security" class="footer-link-item">Keamanan</a>
              <a href="https://wa.me/6281289000000" target="_blank" rel="noopener noreferrer" class="footer-link-item footer-link-wa">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.16 7.59C9 7.59 8.78 7.6 8.58 7.94C8.38 8.28 7.82 8.8 7.82 9.87C7.82 10.94 8.6 11.97 8.71 12.12C8.82 12.27 10.23 14.45 12.4 15.38C14.21 16.16 14.58 16 15 15.96C15.42 15.92 16.34 15.41 16.53 14.87C16.72 14.33 16.72 13.87 16.66 13.77C16.6 13.67 16.45 13.61 16.22 13.5C16 13.39 14.9 12.85 14.69 12.78C14.49 12.7 14.34 12.66 14.19 12.89C14.04 13.12 13.62 13.61 13.49 13.77C13.36 13.92 13.23 13.94 13.01 13.83C12.79 13.72 12.07 13.48 11.23 12.73C10.57 12.14 10.12 11.42 10 11.2C9.87 10.98 9.98 10.87 10.1 10.75C10.2 10.65 10.32 10.49 10.43 10.36C10.55 10.23 10.59 10.13 10.66 9.99C10.74 9.84 10.7 9.71 10.64 9.6C10.59 9.49 10.13 8.36 9.94 7.9C9.76 7.46 9.57 7.52 9.43 7.51C9.3 7.51 9.16 7.59 9.16 7.59Z"/>
                </svg>
                <span>Kontak/WhatsApp</span>
              </a>
            </nav>

            <!-- Legal and Disclaimer -->
            <div class="footer-legal-col">
              <div>© 2026 Rumper · Prototype landing page</div>
              <div class="footer-legal-sub">Jabodetabek · Location risk intelligence for homebuyers</div>
            </div>
          </div>
        </div>
      </div>
    </section>`;

export default function LandingV2() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!containerRef.current) return;

    let cleanupListeners: Array<() => void> = [];

    const runScripts = () => {
      // 0. SPA link delegation for internal routes (e.g. /terms, /privacy, /security)
      const handleInternalClick = (e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest("a");
        if (!target) return;
        const href = target.getAttribute("href");
        if (
          href &&
          href.startsWith("/") &&
          !href.startsWith("//") &&
          target.target !== "_blank" &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey
        ) {
          e.preventDefault();
          navigate(href);
        }
      };
      if (containerRef.current) {
        containerRef.current.addEventListener("click", handleInternalClick);
        cleanupListeners.push(() => {
          if (containerRef.current) {
            containerRef.current.removeEventListener("click", handleInternalClick);
          }
        });
      }

      // 1. Sticky nav scroll
      const navWrap = document.getElementById("navWrap");
      const onScroll = () => {
        if (navWrap) {
          navWrap.classList.toggle("scrolled", window.scrollY > 24);
        }
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanupListeners.push(() => window.removeEventListener("scroll", onScroll));

      // 1b. Mobile Fluid Expanding Floating Navbar
      const mainNav = document.getElementById("mainNav");
      const navMenuBtn = document.getElementById("navMenuBtn");
      const navBackdrop = document.getElementById("navBackdrop");
      const navExpandedBody = document.getElementById("navExpandedBody");

      if (mainNav && navMenuBtn) {
        const toggleMobileNav = (e: MouseEvent) => {
          e.stopPropagation();
          const isExpanded = mainNav.classList.toggle("is-expanded");
          navMenuBtn.setAttribute("aria-expanded", String(isExpanded));
          if (navExpandedBody) {
            navExpandedBody.setAttribute("aria-hidden", String(!isExpanded));
          }
          if (navBackdrop) {
            navBackdrop.classList.toggle("is-active", isExpanded);
          }
          document.body.classList.toggle("mobile-menu-locked", isExpanded);
        };

        const closeMobileNav = () => {
          if (mainNav.classList.contains("is-expanded")) {
            mainNav.classList.remove("is-expanded");
            navMenuBtn.setAttribute("aria-expanded", "false");
            if (navExpandedBody) navExpandedBody.setAttribute("aria-hidden", "true");
            if (navBackdrop) navBackdrop.classList.remove("is-active");
            document.body.classList.remove("mobile-menu-locked");
          }
        };

        navMenuBtn.addEventListener("click", toggleMobileNav);
        if (navBackdrop) {
          navBackdrop.addEventListener("click", closeMobileNav);
        }

        // Close when clicking any link inside the expanded body
        if (navExpandedBody) {
          navExpandedBody.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
              closeMobileNav();
            });
          });
        }

        // Close on Escape key
        const onEscKeyDown = (e: KeyboardEvent) => {
          if (e.key === "Escape" && mainNav.classList.contains("is-expanded")) {
            closeMobileNav();
          }
        };
        document.addEventListener("keydown", onEscKeyDown);

        cleanupListeners.push(() => {
          navMenuBtn.removeEventListener("click", toggleMobileNav);
          if (navBackdrop) navBackdrop.removeEventListener("click", closeMobileNav);
          document.removeEventListener("keydown", onEscKeyDown);
          document.body.classList.remove("mobile-menu-locked");
        });
      }


      // 2. Journey interaction
      const journeyCards = [...document.querySelectorAll(".journey-card")];
      journeyCards.forEach((card) => {
        const activate = () => {
          journeyCards.forEach((c) => {
            c.classList.remove("active");
            c.setAttribute("aria-pressed", "false");
          });
          card.classList.add("active");
          card.setAttribute("aria-pressed", "true");
        };
        card.addEventListener("mouseenter", activate);
        card.addEventListener("focusin", activate);
        card.addEventListener("click", activate);
        const onKey = (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate();
          }
        };
        card.addEventListener("keydown", onKey);
      });

      // 3. Risk Explorer tabs
      const shell = document.getElementById("showcaseShell");
      const showCard = document.getElementById("showCard");
      const showPill = document.getElementById("showPill");
      const showTitle = document.getElementById("showTitle");
      const showBody = document.getElementById("showBody");
      const metricLabel = document.getElementById("metricLabel");
      const metricSub = document.getElementById("metricSub");
      const metricNumber = document.getElementById("metricNumber");

      const riskContent = {
        flood: {
          pill: "Ketahanan Banjir",
          title: "Deteksi potensi genangan dari data resmi InaRISK BNPB.",
          body: "Menampilkan zonasi kerawanan banjir berkala, titik genangan historis, dan korelasi kontur elevasi tanah di sekitar lokasi.",
          label: "Status zonasi",
          sub: "InaRISK BNPB",
          number: "Sedang",
        },
        commute: {
          pill: "Efisiensi Commute",
          title: "Simulasi waktu tempuh saat jam sibuk, bukan tengah malam.",
          body: "Google Routes memodelkan rute harian menuju pusat kerja dan stasiun KRL/LRT pada jam sibuk pagi (07.00–08.30 WIB) lengkap dengan rasio kemacetan.",
          label: "Rasio macet",
          sub: "puncak pagi vs lancar",
          number: "1.6x",
        },
        access: {
          pill: "Akses Fisik & Jalan",
          title: "Konektivitas gerbang tol dan lebar jalan lingkungan.",
          body: "Analisis jarak ke gerbang tol terdekat, klasifikasi jalan (kolektor vs lokal), dan potensi bottleneck pada akses keluar-masuk perumahan.",
          label: "Tol terdekat",
          sub: "jarak berkendara",
          number: "3.2 km",
        },
        facilities: {
          pill: "Fasilitas Esensial",
          title: "Ketersediaan fasilitas harian dalam radius 3 km.",
          body: "Pemetaan fasilitas esensial mencakup rumah sakit darurat, klinik 24 jam, sekolah, dan pasar modern dalam radius jangkauan hidup.",
          label: "Fasilitas aktif",
          sub: "dalam radius 3 km",
          number: "18 Fasilitas",
        },
        environment: {
          pill: "Bahaya Lingkungan",
          title: "Verifikasi jarak aman bahaya fisik dan polutan.",
          body: "Deteksi perimeter bahaya objektif: jalur transmisi SUTET (jarak aman >250m), TPA sampah (>1.5km), kawasan industri, dan rel kereta api aktif.",
          label: "Jarak SUTET",
          sub: "radius perimeter aman",
          number: "> 550 m",
        },
      };

      document.querySelectorAll(".show-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          const theme = tab.dataset.theme;
          document.querySelectorAll(".show-tab").forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
          if (showCard) showCard.classList.add("swap");
          setTimeout(() => {
            if (shell) shell.dataset.theme = theme;
            const c = riskContent[theme];
            if (c) {
              if (showPill) showPill.textContent = c.pill;
              if (showTitle) showTitle.textContent = c.title;
              if (showBody) showBody.textContent = c.body;
              if (metricLabel) metricLabel.textContent = c.label;
              if (metricSub) metricSub.textContent = c.sub;
              if (metricNumber) metricNumber.textContent = c.number;
            }
            if (showCard) showCard.classList.remove("swap");
          }, 170);
        });
      });

      // 4. Accordion + GIS Risk Inspector Interactive HUD
      const orbit = document.getElementById("visualOrbit");
      const gisPillText = document.getElementById("gisPillText");
      const gisDesc1 = document.getElementById("gisDesc1");
      const gisSource = document.getElementById("gisSource");
      const gisStatus = document.getElementById("gisStatus");
      const gisMainMetric = document.getElementById("gisMainMetric");
      const gisDesc2 = document.getElementById("gisDesc2");
      const gisLayerLabel = document.getElementById("gisLayerLabel");
      const gisHudTL = document.getElementById("gisHudTL");
      const gisHudBR = document.getElementById("gisHudBR");

      const gisInspectionData = [
        {
          pill: "Elevasi +18.4m dpl",
          desc1: "Berada 3.2m lebih tinggi dari cekungan saluran air primer terdekat.",
          source: "InaRISK BNPB",
          status: "TERVALIDASI",
          mainMetric: "Bebas Riwayat Banjir",
          desc2: "Radius 500m tidak tercatat dalam riwayat genangan 5 tahun terakhir.",
          layer: "Layer: Kontur DEM & BNPB",
          theme: "theme-flood"
        },
        {
          pill: "Commute Kantor: 38 Menit",
          desc1: "Dihitung tepat pada peak jam sibuk 07.15 WIB menggunakan rute dinamis.",
          source: "Google Routes Engine",
          status: "ANALISIS SIBUK",
          mainMetric: "Stasiun KRL: 1.4 km",
          desc2: "Akses angkutan pengumpan tersedia dalam jarak jalan kaki 6 menit.",
          layer: "Layer: Google Routes Traffic",
          theme: "theme-commute"
        },
        {
          pill: "Lebar Jalan: 6.5 Meter",
          desc1: "Leluasa untuk papasan 2 mobil keluarga tanpa perlu menepi ke bahu jalan.",
          source: "OpenStreetMap & Satelit",
          status: "RAMAH KENDARAAN",
          mainMetric: "Bebas Jalan Buntu",
          desc2: "Akses ganda menghubungkan langsung perumahan ke jalan arteri sekunder.",
          layer: "Layer: Geometri Akses Jalan",
          theme: "theme-access"
        },
        {
          pill: "Jarak SUTET: 480 Meter",
          desc1: "Jauh di luar batas minimal zona aman radiasi elektromagnetik (≤250m).",
          source: "Spatial Hazard DB",
          status: "ZONA AMAN",
          mainMetric: "TPA Sampah: > 4.5 km",
          desc2: "Bebas risiko bau musiman dan kontaminasi air tanah perumahan.",
          layer: "Layer: Radius Bahaya Lingkungan",
          theme: "theme-hazard"
        },
        {
          pill: "RS Darurat: 1.8 km",
          desc1: "Fasilitas IGD 24 jam dan apotek siaga dapat dijangkau dalam < 8 menit.",
          source: "Kemenkes & Google Places",
          status: "LENGKAP",
          mainMetric: "Sekolah & Pasar: ≤ 2.2 km",
          desc2: "Kebutuhan harian esensial keluarga terpenuhi tanpa harus keluar kawasan.",
          layer: "Layer: Fasilitas Esensial 3km",
          theme: "theme-facility"
        }
      ];

      document.querySelectorAll(".acc").forEach((acc, i) => {
        acc.addEventListener("click", () => {
          document.querySelectorAll(".acc").forEach((a) => a.classList.remove("active"));
          acc.classList.add("active");

          const data = gisInspectionData[i] || gisInspectionData[0];

          if (gisHudTL) {
            gisHudTL.style.opacity = "0.3";
            gisHudTL.style.transform = "translateY(-6px)";
          }
          if (gisHudBR) {
            gisHudBR.style.opacity = "0.3";
            gisHudBR.style.transform = "translateY(6px)";
          }

          if (orbit) {
            orbit.classList.add("orbit-switching");
            orbit.setAttribute("data-active-index", String(i));
          }

          setTimeout(() => {
            if (gisPillText) gisPillText.textContent = data.pill;
            if (gisDesc1) gisDesc1.textContent = data.desc1;
            if (gisSource) gisSource.textContent = data.source;
            if (gisStatus) gisStatus.textContent = data.status;
            if (gisMainMetric) gisMainMetric.textContent = data.mainMetric;
            if (gisDesc2) gisDesc2.textContent = data.desc2;
            if (gisLayerLabel) gisLayerLabel.textContent = data.layer;

            if (orbit) {
              orbit.setAttribute("data-theme", data.theme);
              orbit.classList.remove("orbit-switching");
            }

            if (gisHudTL) {
              gisHudTL.style.opacity = "1";
              gisHudTL.style.transform = "translateY(0)";
            }
            if (gisHudBR) {
              gisHudBR.style.opacity = "1";
              gisHudBR.style.transform = "translateY(0)";
            }
          }, 180);
        });
      });

      // 6. Search Flow with animation and real navigation to /app/start
      document.querySelectorAll(".search-box").forEach((form) => {
        const input = form.querySelector("input");
        const button = form.querySelector("button");

        if (input && button) {
          const updateActiveState = () => {
            const hasText = Boolean(input.value && input.value.trim().length > 0);
            const isFocused = document.activeElement === input;
            if (isFocused || hasText) {
              form.classList.add("is-active");
            } else {
              form.classList.remove("is-active");
            }
          };

          input.addEventListener("focus", updateActiveState);
          input.addEventListener("blur", () => {
            setTimeout(updateActiveState, 150);
          });
          input.addEventListener("input", updateActiveState);
        }

        form.addEventListener("submit", (e) => {
          e.preventDefault();
          if (button) button.click();
        });
        if (!button) return;
        button.addEventListener("click", () => {
          if (!input) return;
          if (!input.value.trim()) {
            input.focus();
            input.placeholder = "Contoh: Grand Galaxy City, Bekasi";
            return;
          }
          const original = button.innerHTML;
          button.style.width = button.offsetWidth + "px";
          button.innerHTML = '<span class="btn-content-fade out">Memeriksa…</span>';

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const span = button.querySelector("span");
              if (span) span.classList.remove("out");
            });
          });

          button.disabled = true;
          setTimeout(() => {
            const span = button.querySelector("span");
            if (span) span.classList.add("out");
            setTimeout(() => {
              if (span) {
                span.innerHTML = "Membuka analisis…";
                span.classList.remove("out");
              }
              setTimeout(() => {
                window.location.href = "/app/start?q=" + encodeURIComponent(input.value);
              }, 300);
            }, 150);
          }, 450);
        });
      });

      // 7. Feature Carousel Touch Swipe, Drag & Indicator Sync
      const featureCarousel = document.getElementById("featureCarousel");
      if (featureCarousel) {
        const cards = Array.from(featureCarousel.querySelectorAll(".carousel-card"));
        const prevBtn = document.getElementById("carouselPrevBtn");
        const nextBtn = document.getElementById("carouselNextBtn");
        const dots = Array.from(document.querySelectorAll("#carouselDots .carousel-dot"));

        let activeIndex = 0;
        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;
        let dragDistance = 0;

        function updateActiveCard(idx) {
          if (typeof idx === "number") {
            activeIndex = Math.max(0, Math.min(idx, cards.length - 1));
          } else {
            const carouselRect = featureCarousel.getBoundingClientRect();
            const carouselCenter = carouselRect.left + carouselRect.width / 2;
            let closestDist = Infinity;
            let closestIdx = 0;

            cards.forEach((card, i) => {
              const cardRect = card.getBoundingClientRect();
              const cardCenter = cardRect.left + cardRect.width / 2;
              const dist = Math.abs(carouselCenter - cardCenter);
              if (dist < closestDist) {
                closestDist = dist;
                closestIdx = i;
              }
            });
            activeIndex = closestIdx;
          }

          cards.forEach((card, i) => {
            card.classList.toggle("active", i === activeIndex);
          });

          dots.forEach((dot, i) => {
            const isActive = i === activeIndex;
            dot.classList.toggle("active", isActive);
            dot.setAttribute("aria-selected", isActive ? "true" : "false");
          });

          if (prevBtn) prevBtn.style.opacity = activeIndex === 0 ? "0.4" : "1";
          if (nextBtn) nextBtn.style.opacity = activeIndex === cards.length - 1 ? "0.4" : "1";
        }

        function scrollToCard(index) {
          if (index < 0) index = 0;
          if (index >= cards.length) index = cards.length - 1;
          activeIndex = index;
          cards[index].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
          updateActiveCard(index);
        }

        // Click card to center
        cards.forEach((card, i) => {
          card.addEventListener("click", () => {
            if (Math.abs(dragDistance) < 6) {
              scrollToCard(i);
            }
          });
        });

        // Prev & Next Buttons
        if (prevBtn) {
          prevBtn.addEventListener("click", () => scrollToCard(activeIndex - 1));
        }
        if (nextBtn) {
          nextBtn.addEventListener("click", () => scrollToCard(activeIndex + 1));
        }

        // Dots Click
        dots.forEach((dot, i) => {
          dot.addEventListener("click", () => scrollToCard(i));
        });

        // Touch Swipe Gesture for Mobile
        let touchStartX = 0;
        let touchStartY = 0;
        let touchDeltaX = 0;
        let touchDeltaY = 0;
        let isSwiping = false;

        featureCarousel.addEventListener("touchstart", (e) => {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchDeltaX = 0;
          touchDeltaY = 0;
          isSwiping = false;
        }, { passive: true });

        featureCarousel.addEventListener("touchmove", (e) => {
          touchDeltaX = e.touches[0].clientX - touchStartX;
          touchDeltaY = e.touches[0].clientY - touchStartY;
          if (Math.abs(touchDeltaX) > Math.abs(touchDeltaY) && Math.abs(touchDeltaX) > 10) {
            isSwiping = true;
          }
        }, { passive: true });

        featureCarousel.addEventListener("touchend", () => {
          if (isSwiping && Math.abs(touchDeltaX) > 36) {
            if (touchDeltaX < 0) {
              scrollToCard(activeIndex + 1);
            } else {
              scrollToCard(activeIndex - 1);
            }
          }
        }, { passive: true });

        // Mouse Drag to Swipe (for testing & hybrid touch/mouse devices)
        featureCarousel.addEventListener("mousedown", (e) => {
          isDown = true;
          dragDistance = 0;
          startX = e.pageX - featureCarousel.offsetLeft;
          scrollLeft = featureCarousel.scrollLeft;
        });

        window.addEventListener("mousemove", (e) => {
          if (!isDown) return;
          const x = e.pageX - featureCarousel.offsetLeft;
          const walk = (x - startX);
          dragDistance += Math.abs(walk);
          featureCarousel.scrollLeft = scrollLeft - walk;
        });

        window.addEventListener("mouseup", (e) => {
          if (!isDown) return;
          isDown = false;
          if (Math.abs(dragDistance) > 28) {
            const walk = (e.pageX - featureCarousel.offsetLeft) - startX;
            if (walk < -36) {
              scrollToCard(activeIndex + 1);
            } else if (walk > 36) {
              scrollToCard(activeIndex - 1);
            } else {
              scrollToCard(activeIndex);
            }
          }
        });

        // Update active state on scroll (debounced via requestAnimationFrame)
        let scrollTicking = false;
        featureCarousel.addEventListener("scroll", () => {
          if (!scrollTicking) {
            window.requestAnimationFrame(() => {
              updateActiveCard();
              scrollTicking = false;
            });
            scrollTicking = true;
          }
        }, { passive: true });

        // Initial setup
        updateActiveCard(0);
      }

      // 7b. Mobile Pricing Carousel Interaction & Indicator Sync
      const pricingCarousel = document.getElementById("pricingCarousel");
      const pricingDots = Array.from(document.querySelectorAll("#pricingDots .pricing-dot"));
      if (pricingCarousel && pricingDots.length > 0) {
        const pCards = Array.from(pricingCarousel.querySelectorAll(".price-card"));

        const updateActivePricing = (targetIdx?: number) => {
          if (typeof targetIdx === "number") {
            pricingDots.forEach((dot, idx) => {
              const isActive = idx === targetIdx;
              dot.classList.toggle("active", isActive);
              dot.setAttribute("aria-selected", isActive ? "true" : "false");
            });
            return;
          }

          const carouselLeft = pricingCarousel.getBoundingClientRect().left;
          let closestDist = Infinity;
          let closestIdx = 0;

          pCards.forEach((card, i) => {
            const cardLeft = card.getBoundingClientRect().left;
            const dist = Math.abs(cardLeft - carouselLeft - 20);
            if (dist < closestDist) {
              closestDist = dist;
              closestIdx = i;
            }
          });

          pricingDots.forEach((dot, idx) => {
            const isActive = idx === closestIdx;
            dot.classList.toggle("active", isActive);
            dot.setAttribute("aria-selected", isActive ? "true" : "false");
          });
        };

        const scrollToPricingCard = (idx: number) => {
          if (pCards[idx]) {
            const card = pCards[idx] as HTMLElement;
            const scrollTarget = card.offsetLeft - 20;
            pricingCarousel.scrollTo({
              left: Math.max(0, scrollTarget),
              behavior: "smooth",
            });
            updateActivePricing(idx);
          }
        };

        pricingDots.forEach((dot, idx) => {
          dot.addEventListener("click", () => {
            scrollToPricingCard(idx);
          });
        });

        let pricingScrollTicking = false;
        const onPricingScroll = () => {
          if (!pricingScrollTicking) {
            window.requestAnimationFrame(() => {
              updateActivePricing();
              pricingScrollTicking = false;
            });
            pricingScrollTicking = true;
          }
        };
        pricingCarousel.addEventListener("scroll", onPricingScroll, { passive: true });
        cleanupListeners.push(() => pricingCarousel.removeEventListener("scroll", onPricingScroll));

        // Touch swipe enhancement
        let pTouchStartX = 0;
        let pTouchEndX = 0;
        const onPTouchStart = (e: TouchEvent) => {
          pTouchStartX = e.changedTouches[0].screenX;
        };
        const onPTouchEnd = (e: TouchEvent) => {
          pTouchEndX = e.changedTouches[0].screenX;
          const diff = pTouchStartX - pTouchEndX;
          if (Math.abs(diff) > 40) {
            const currentActive = pricingDots.findIndex((d) => d.classList.contains("active"));
            const currentIdx = currentActive >= 0 ? currentActive : 0;
            if (diff > 0 && currentIdx < pCards.length - 1) {
              scrollToPricingCard(currentIdx + 1);
            } else if (diff < 0 && currentIdx > 0) {
              scrollToPricingCard(currentIdx - 1);
            }
          }
        };

        pricingCarousel.addEventListener("touchstart", onPTouchStart as EventListener, { passive: true });
        pricingCarousel.addEventListener("touchend", onPTouchEnd as EventListener, { passive: true });
        cleanupListeners.push(() => {
          pricingCarousel.removeEventListener("touchstart", onPTouchStart as EventListener);
          pricingCarousel.removeEventListener("touchend", onPTouchEnd as EventListener);
        });

        // Initial setup
        updateActivePricing(0);
      }

      // 8. 3D Card Stack Carousel Interaction
      const stack = document.getElementById("heroCardStack");
      if (stack) {
        const tabs = stack.querySelectorAll("#cardStackTabs .mini-tab");
        const cards = stack.querySelectorAll(".floating-report.stacked");

        let cardOrders = [0, 1, 2, 3]; // map of cardId -> current order

        function selectCard(targetId) {
          const currentOrderOfTarget = cardOrders[targetId];
          if (currentOrderOfTarget === 0) return;

          for (let i = 0; i < cards.length; i++) {
            if (i === targetId) {
              cardOrders[i] = 0;
            } else if (cardOrders[i] < currentOrderOfTarget) {
              cardOrders[i]++;
            }
          }

          cards.forEach((card) => {
            const cid = parseInt(card.getAttribute("data-id") || "0", 10);
            card.setAttribute("data-order", String(cardOrders[cid]));
          });

          tabs.forEach((tab) => {
            const tid = parseInt(tab.getAttribute("data-id") || "0", 10);
            if (tid === targetId) tab.classList.add("active");
            else tab.classList.remove("active");
          });
        }

        function cycleNextCard() {
          let currentTopId = cardOrders.indexOf(0);
          if (currentTopId === -1) currentTopId = 0;
          const nextTargetId = (currentTopId + 1) % cards.length;
          
          const currentTopCard = stack.querySelector(`.floating-report.stacked[data-id="${currentTopId}"]`);
          if (currentTopCard) {
            currentTopCard.classList.add("tossing-card");
            setTimeout(() => {
              selectCard(nextTargetId);
              currentTopCard.classList.remove("tossing-card");
            }, 140);
          } else {
            selectCard(nextTargetId);
          }
        }

        tabs.forEach((tab) => {
          tab.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = parseInt(tab.getAttribute("data-id") || "0", 10);
            selectCard(id);
          });
        });

        cards.forEach((card) => {
          card.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = parseInt(card.getAttribute("data-id") || "0", 10);
            if (cardOrders[id] === 0) {
              // Clicked top active card -> physically cycles to next card
              cycleNextCard();
            } else {
              // Clicked peeking background card -> brings it directly to front
              selectCard(id);
            }
          });
          card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              const id = parseInt(card.getAttribute("data-id") || "0", 10);
              if (cardOrders[id] === 0) {
                cycleNextCard();
              } else {
                selectCard(id);
              }
            }
          });
        });

        const onDocClick = (e) => {
          if (!stack.contains(e.target)) {
            stack.classList.remove("expanded");
            stack.setAttribute("aria-expanded", "false");
          }
        };
        document.addEventListener("click", onDocClick);
        cleanupListeners.push(() => document.removeEventListener("click", onDocClick));

        let touchStartX = 0;
        let touchEndX = 0;

        stack.addEventListener(
          "touchstart",
          (e) => {
            touchStartX = e.changedTouches[0].screenX;
          },
          { passive: true }
        );

        stack.addEventListener(
          "touchend",
          (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
          },
          { passive: true }
        );

        function handleSwipe() {
          const threshold = 40;
          if (touchEndX < touchStartX - threshold) {
            const currentTopId = cardOrders.indexOf(0);
            const nextId = (currentTopId + 1) % 4;
            selectCard(nextId);
          } else if (touchEndX > touchStartX + threshold) {
            const currentTopId = cardOrders.indexOf(0);
            const prevId = (currentTopId - 1 + 4) % 4;
            selectCard(prevId);
          }
        }
      }

      // 9. Dark Band In-View Observer
      const darkBand = document.getElementById("darkBandSection");
      if (darkBand) {
        const darkBandObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                darkBand.classList.add("is-visible");
                darkBandObserver.unobserve(darkBand);
              }
            });
          },
          { threshold: 0.15 }
        );
        darkBandObserver.observe(darkBand);
        cleanupListeners.push(() => darkBandObserver.disconnect());
      }

      // 10. Universal Scroll Reveal Observer
      const revealElements = document.querySelectorAll(".reveal");
      if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("in");
                revealObserver.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
        );
        revealElements.forEach((el) => revealObserver.observe(el));
        cleanupListeners.push(() => revealObserver.disconnect());
      }
    };

    try {
      runScripts();
    } catch (e) {
      console.error("Error running LandingV2 scripts:", e);
    }

    return () => {
      cleanupListeners.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <div ref={containerRef} className="landing-v2-container">
      <div dangerouslySetInnerHTML={{ __html: NAV_HTML }} />
      <main id="top">
        <KineticGrid
          className="hero min-h-0"
          transparentBg={true}
          globalColor="default"
        >

          <div dangerouslySetInnerHTML={{ __html: HERO_INNER_HTML }} />
        </KineticGrid>
        <div dangerouslySetInnerHTML={{ __html: MAIN_PRE_FAQ_HTML }} />
        <FrequentlyAskedQuestions className="faq-section bg-[#f8faf8]" />
        <div dangerouslySetInnerHTML={{ __html: FOOTER_HTML }} />
      </main>
    </div>
  );
}
