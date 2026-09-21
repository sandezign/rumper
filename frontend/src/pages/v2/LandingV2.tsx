// @ts-nocheck
import React, { useEffect, useRef } from "react";
import "./LandingV2.css";

const LANDING_HTML = `<div class="nav-wrap" id="navWrap">
    <nav class="nav">
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
        <a href="#yang-dicek">Yang Dicek</a>
        <a href="#contoh">Contoh Laporan</a>
        <a href="#harga">Harga</a>
        <a href="#faq">FAQ</a>
      </div>
      <div class="nav-actions">
        <a class="btn btn-ghost" href="#contoh">Lihat Contoh</a>
        <a class="btn btn-accent" href="#cek">Cek Lokasi <span class="arrow">→</span></a>
      </div>
    </nav>
  </div>

  <main id="top">
    <section class="hero">
      <div class="hero-grid">
        <div class="hero-copy reveal">
          <span class="pill"><span class="eyebrow-dot"></span> Beta · Jabodetabek</span>
          <h1>Sudah suka rumahnya?<br><span class="accent">Cek dulu risiko lokasinya.</span></h1>
          <p class="lead">Banjir, akses jalan, kondisi lingkungan, dan risiko sekitar sering tidak terlihat saat survei rumah. Rumper membantu Anda mengecek hal-hal penting sebelum booking fee atau DP.</p>

          <form class="search-box" id="heroSearch" onsubmit="return false;">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2"/>
              <path d="m16 16 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input aria-label="Alamat atau nama perumahan" placeholder="Cari nama perumahan atau alamat incaran..." />
            <button class="btn btn-accent" type="submit">Cek Lokasi <span class="arrow">→</span></button>
          </form>

          <div class="hero-micro">
            <span><span class="check">✓</span> 1 lokasi gratis</span>
            <span><span class="check">✓</span> Tidak perlu daftar</span>
            <span><span class="check">✓</span> Sumber data ditampilkan</span>
          </div>
        </div>

        <div class="hero-stage reveal" aria-label="Contoh tampilan laporan Rumper">
          <div class="card-stack" id="heroCardStack" aria-expanded="false" role="group" aria-label="Pilihan contoh laporan lokasi">
            <div class="report-tabs" id="cardStackTabs">
              <button class="mini-tab active" data-id="0" aria-label="Tampilkan laporan Grand Galaxy City">⌁</button>
              <button class="mini-tab" data-id="1" aria-label="Tampilkan laporan Kota Wisata">✦</button>
              <button class="mini-tab" data-id="2" aria-label="Tampilkan laporan BSD City">⌖</button>
              <button class="mini-tab" data-id="3" aria-label="Tampilkan laporan PIK 2">☰</button>
            </div>
            
            <!-- Card 4 (Index 3) -->
            <div class="floating-report stacked" data-id="3" data-order="3" role="button" tabindex="0" aria-label="Tampilkan laporan PIK 2">
              <div class="report-head">
                <div class="report-location">
                  <div class="pin" style="background:#ffeaee;color:#d32f2f">⌂</div>
                  <div>
                    <strong style="font-size:17px;color:#07263a">PIK 2</strong>
                    <div class="small muted" style="margin-top:2px;font-size:14px">Jakarta Utara</div>
                  </div>
                </div>
                <span class="risk-chip" style="background:#ffeaee;color:#d32f2f">Rawan Banjir</span>
              </div>
              <div class="map">
                <div class="risk-zone" style="left:50%;top:50%;background:radial-gradient(circle at 50% 50%,rgba(211,47,47,.32),transparent 72%);width:180px;height:180px;"></div>
                <div class="property-marker" style="left:50%;top:50%;background:#ef5350;box-shadow:0 0 0 6px rgba(239,83,80,.18);"></div>
              </div>
              <div class="report-row" style="display:flex;justify-content:space-between;align-items:center;padding:16px 0 8px;border-top:1px solid var(--line);color:#536b75">
                <div style="font-size:15px">4 temuan kritis</div>
                <div class="report-score" style="font-size:20px;color:#536b75;font-style:italic;font-family:'Caveat', cursive, sans-serif">55/100</div>
              </div>
            </div>

            <!-- Card 3 (Index 2) -->
            <div class="floating-report stacked" data-id="2" data-order="2" role="button" tabindex="0" aria-label="Tampilkan laporan BSD City">
              <div class="report-head">
                <div class="report-location">
                  <div class="pin" style="background:#eaf5ef;color:#00684a">⌂</div>
                  <div>
                    <strong style="font-size:17px;color:#07263a">BSD City</strong>
                    <div class="small muted" style="margin-top:2px;font-size:14px">Tangerang Selatan</div>
                  </div>
                </div>
                <span class="risk-chip" style="background:#eaf5ef;color:#00684a">Sangat Aman</span>
              </div>
              <div class="map">
                <div class="property-marker" style="left:50%;top:50%;background:var(--accent);box-shadow:0 0 0 6px rgba(0,237,100,.18);"></div>
              </div>
              <div class="report-row" style="display:flex;justify-content:space-between;align-items:center;padding:16px 0 8px;border-top:1px solid var(--line);color:#536b75">
                <div style="font-size:15px">Tidak ada temuan mayor</div>
                <div class="report-score" style="font-size:20px;color:#536b75;font-style:italic;font-family:'Caveat', cursive, sans-serif">94/100</div>
              </div>
            </div>

            <!-- Card 2 (Index 1) -->
            <div class="floating-report stacked" data-id="1" data-order="1" role="button" tabindex="0" aria-label="Tampilkan laporan Kota Wisata">
              <div class="report-head">
                <div class="report-location">
                  <div class="pin" style="background:#fff8e0;color:#d79a2b">⌂</div>
                  <div>
                    <strong style="font-size:17px;color:#07263a">Kota Wisata</strong>
                    <div class="small muted" style="margin-top:2px;font-size:14px">Cibubur</div>
                  </div>
                </div>
                <span class="risk-chip" style="background:#fff8e0;color:#d79a2b">Cek Akses</span>
              </div>
              <div class="map">
                <div class="risk-zone" style="left:60%;top:20%;background:radial-gradient(circle at 45% 50%,rgba(215,154,43,.32),transparent 72%)"></div>
                <div class="property-marker" style="left:40%;top:60%;background:#f5b73b;box-shadow:0 0 0 6px rgba(245,183,59,.18);"></div>
              </div>
              <div class="report-row" style="display:flex;justify-content:space-between;align-items:center;padding:16px 0 8px;border-top:1px solid var(--line);color:#536b75">
                <div style="font-size:15px">1 temuan mobilitas</div>
                <div class="report-score" style="font-size:20px;color:#536b75;font-style:italic;font-family:'Caveat', cursive, sans-serif">82/100</div>
              </div>
            </div>

            <!-- Card 1 (Index 0) -->
            <div class="floating-report stacked" data-id="0" data-order="0" role="button" tabindex="0" aria-label="Tampilkan laporan Grand Galaxy City">
              <div class="report-head">
                <div class="report-location">
                  <div class="pin" style="background:#eaf5ef;color:#00684a">⌂</div>
                  <div>
                    <strong style="font-size:17px;color:#07263a">Grand Galaxy City</strong>
                    <div class="small muted" style="margin-top:2px;font-size:14px">Bekasi Selatan</div>
                  </div>
                </div>
                <span class="risk-chip">Perlu validasi</span>
              </div>
              <div class="map">
                <div class="risk-zone"></div>
                <div class="property-marker"></div>
              </div>
              <div class="report-row" style="display:flex;justify-content:space-between;align-items:center;padding:16px 0 8px;border-top:1px solid var(--line);color:#536b75">
                <div style="font-size:15px">3 temuan perlu diperhatikan</div>
                <div class="report-score" style="font-size:20px;color:#536b75;font-style:italic;font-family:'Caveat', cursive, sans-serif">
                  68/100
                </div>
              </div>
            </div>
          </div>
          <div class="stage-label">Contoh visual · data ilustratif untuk prototype</div>
        </div>
      </div>
    </section>

    <section class="section" id="cara-kerja">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow"><span class="eyebrow-dot"></span> Cara kerja</span>
          <h2>Dari rumah incaran menjadi keputusan yang lebih yakin.</h2>
          <p class="lead" style="margin-inline:auto">Rumper membantu Anda bergerak dari alamat → bukti → pemahaman → tindakan, tanpa harus mengerti GIS atau membaca dataset mentah.</p>
        </div>

        <div class="journey" id="journey">
          <article class="journey-card active" data-step="0" role="button" tabindex="0" aria-pressed="true" aria-label="Langkah 1: Cari lokasi">
            <span class="journey-num">01</span>
            <h3>Cari</h3>
            <p>Masukkan nama perumahan atau alamat yang sedang Anda pertimbangkan.</p>
            <div class="journey-ui">
              <div class="journey-search">
                <div class="pin" style="width:30px;height:30px">⌂</div>
                <div><b>Grand Galaxy City</b><br><span>Bekasi Selatan</span></div>
              </div>
            </div>
          </article>

          <article class="journey-card" data-step="1" role="button" tabindex="0" aria-pressed="false" aria-label="Langkah 2: Periksa faktor lokasi">
            <span class="journey-num">02</span>
            <h3>Periksa</h3>
            <p>Rumper membaca beberapa faktor lokasi yang relevan di sekitar properti.</p>
            <div class="journey-ui">
              <div class="mini-line"></div><div class="mini-line short"></div>
              <span class="mini-pill">Banjir</span><span class="mini-pill">Akses</span><span class="mini-pill">Lingkungan</span>
            </div>
          </article>

          <article class="journey-card" data-step="2" role="button" tabindex="0" aria-pressed="false" aria-label="Langkah 3: Pahami temuan">
            <span class="journey-num">03</span>
            <h3>Pahami</h3>
            <p>Temuan diterjemahkan ke bahasa sederhana, bukan istilah teknis yang membingungkan.</p>
            <div class="journey-ui">
              <div class="mini-pill">⚠ Potensi genangan</div>
              <div class="mini-line" style="margin-top:16px"></div><div class="mini-line tiny"></div>
            </div>
          </article>

          <article class="journey-card" data-step="3" role="button" tabindex="0" aria-pressed="false" aria-label="Langkah 4: Putuskan tindakan">
            <span class="journey-num">04</span>
            <h3>Putuskan</h3>
            <p>Tahu apa yang perlu dicek lagi, dinegosiasikan, atau dianggap sebagai red flag.</p>
            <div class="journey-ui">
              <div class="mini-pill">✓ Cek setelah hujan</div>
              <div class="mini-pill">✓ Validasi akses sore</div>
              <div class="mini-pill">✓ Tanyakan riwayat warga</div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:30px">
      <div class="container">
        <div class="showcase-shell reveal" id="showcaseShell" data-theme="flood">
          <div class="showcase-title">
            <span class="eyebrow">Eksplorasi Risiko</span>
            <h2 style="font-size:clamp(40px,4vw,64px)">Apa yang perlu dicek sebelum keluar uang?</h2>
          </div>

          <div class="showcase-tabs" role="tablist" aria-label="Kategori risiko">
            <button class="show-tab active" data-theme="flood" role="tab">Banjir</button>
            <button class="show-tab" data-theme="environment" role="tab">Lingkungan</button>
            <button class="show-tab" data-theme="access" role="tab">Akses</button>
            <button class="show-tab" data-theme="around" role="tab">Sekitar</button>
          </div>

          <div class="show-card" id="showCard">
            <div class="show-copy">
              <span class="pill" id="showPill">Risiko banjir</span>
              <h3 id="showTitle">Ada potensi genangan di akses utama.</h3>
              <p id="showBody">Rumper membantu menunjukkan temuan yang perlu Anda validasi di lapangan sebelum membuat komitmen finansial.</p>
              <a class="link" href="#transparansi" style="font-weight:760;display:inline-flex;align-items:center;gap:8px">Lihat bukti lokasi <span class="arrow">→</span></a>
            </div>
            <div class="show-visual">
              <div class="mini-map">
                <div class="road r1"></div><div class="road r2"></div>
                <div class="halo" id="showHalo"></div>
                <div class="home-dot"></div>
                <div class="metric-card">
                  <div><strong id="metricLabel">Area terdekat</strong><br><span id="metricSub">dari gerbang utama</span></div>
                  <div class="metric-number" id="metricNumber">±120 m</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="dark-band reveal">
          <div>
            <span class="eyebrow" style="color:#8ef1bd">Bukan map explorer</span>
            <h2>Yang Anda butuhkan bukan lebih banyak data. Tapi keputusan yang lebih jelas.</h2>
          </div>
          <p>Rumper dirancang untuk pembeli rumah non-expert. Temuan lokasi disederhanakan menjadi apa yang perlu diketahui, kenapa itu penting, dan apa yang sebaiknya dilakukan berikutnya.</p>
        </div>
      </div>
    </section>

    <section class="section" id="yang-dicek">
      <div class="container split">
        <div class="reveal">
          <span class="eyebrow"><span class="eyebrow-dot"></span> Analisis Risiko</span>
          <h2>Yang tidak selalu terlihat saat survei rumah.</h2>
          <p class="lead">Klik kategori untuk melihat bagaimana Rumper mengubah data lokasi menjadi konteks yang lebih mudah dipahami.</p>

          <div class="accordion" id="accordion">
            <button class="acc active" data-acc="0">
              <div class="acc-head"><span>Risiko bencana</span><span>↗</span></div>
              <p>Potensi banjir, kedekatan terhadap faktor risiko, dan riwayat kejadian yang relevan.</p>
            </button>
            <button class="acc" data-acc="1">
              <div class="acc-head"><span>Kondisi lingkungan</span><span>↗</span></div>
              <p>Kualitas udara, kebisingan, dan potensi gangguan lingkungan di sekitar properti.</p>
            </button>
            <button class="acc" data-acc="2">
              <div class="acc-head"><span>Akses & mobilitas</span><span>↗</span></div>
              <p>Kondisi akses kendaraan, kemudahan keluar-masuk, dan faktor mobilitas yang perlu divalidasi.</p>
            </button>
            <button class="acc" data-acc="3">
              <div class="acc-head"><span>Kelayakan sekitar</span><span>↗</span></div>
              <p>Akses ke fasilitas dan indikator sekitar yang membantu menilai kenyamanan tinggal.</p>
            </button>
          </div>
        </div>

        <div class="visual-orbit reveal" id="visualOrbit">
          <div class="orbit-line l1"></div><div class="orbit-line l2"></div><div class="orbit-line l3"></div><div class="orbit-line l4"></div>
          <div class="orbit-center">Rumper</div>
          <div class="orbit-item o1" id="o1">Banjir</div>
          <div class="orbit-item o2" id="o2">Gempa</div>
          <div class="orbit-item o3" id="o3">Riwayat</div>
          <div class="orbit-item o4" id="o4">Drainase</div>
        </div>
      </div>
    </section>


      <!-- Peeking Carousel Section -->
      <section class="feature-carousel-section" aria-label="End to End Feature Carousel">
        <div class="container">
          <div class="section-head reveal">
            <span class="eyebrow"><span class="eyebrow-dot"></span> Langkah demi Langkah</span>
            <h2>Dari cek lokasi hingga serah terima kunci.</h2>
            <p class="lead" style="color:rgba(255,255,255,0.7);margin:20px auto 0">Semua yang Anda butuhkan untuk membuat keputusan yang tepat, tanpa keraguan.</p>
          </div>
        </div>
        
        <div class="peeking-carousel" id="featureCarousel">
          <!-- Step 1 -->
          <div class="carousel-card active">
            <div class="carousel-card-image">
              <img src="https://images.unsplash.com/photo-1558661091-5cc1b64d0dc5?auto=format&amp;fit=crop&amp;w=1200&amp;q=82" srcset="https://images.unsplash.com/photo-1558661091-5cc1b64d0dc5?auto=format&amp;fit=crop&amp;w=640&amp;q=78 640w, https://images.unsplash.com/photo-1558661091-5cc1b64d0dc5?auto=format&amp;fit=crop&amp;w=1200&amp;q=82 1200w" sizes="(max-width: 768px) 272px, 560px" alt="Rumah modern dengan halaman hijau yang sedang dipertimbangkan pembeli" width="1200" height="800" loading="lazy" decoding="async">
              <span class="photo-context">Mulai dari rumah yang Anda incar</span>
              <a class="photo-credit" href="https://unsplash.com/photos/6sDuV840wxs" target="_blank" rel="noopener noreferrer" aria-label="Foto rumah oleh Jonathan Borba di Unsplash">Unsplash · Jonathan Borba</a>
            </div>
            <h3>1. Cari Lokasi</h3>
            <p>Masukkan alamat atau pin point lokasi rumah yang ingin Anda beli. Rumper akan memulai pencarian data.</p>
          </div>
          <!-- Step 2 -->
          <div class="carousel-card">
            <div class="carousel-card-image">
              <img src="https://images.unsplash.com/photo-1640538212466-fd7e9ac47f8b?auto=format&amp;fit=crop&amp;w=1200&amp;q=82" srcset="https://images.unsplash.com/photo-1640538212466-fd7e9ac47f8b?auto=format&amp;fit=crop&amp;w=640&amp;q=78 640w, https://images.unsplash.com/photo-1640538212466-fd7e9ac47f8b?auto=format&amp;fit=crop&amp;w=1200&amp;q=82 1200w" sizes="(max-width: 768px) 272px, 560px" alt="Jalan lingkungan perumahan yang tergenang setelah hujan" width="1200" height="800" loading="lazy" decoding="async">
              <span class="photo-context">Risiko akses sering baru terlihat setelah hujan</span>
              <a class="photo-credit" href="https://unsplash.com/photos/W-snX25xw3s" target="_blank" rel="noopener noreferrer" aria-label="Foto jalan tergenang oleh yusrizal iskadi di Unsplash">Unsplash · yusrizal iskadi</a>
            </div>
            <h3>2. Analisis AI</h3>
            <p>Mesin analitik kami memindai 40+ titik data termasuk riwayat banjir, kriminalitas, dan zona industri.</p>
          </div>
          <!-- Step 3 -->
          <div class="carousel-card">
            <div class="carousel-card-image">
              <div class="report-score" style="font-size:72px">94<span style="font-size:24px;color:var(--muted)">/100</span></div>
            </div>
            <h3>3. Laporan Komprehensif</h3>
            <p>Dapatkan laporan lengkap dan skor risiko dalam hitungan detik. Keputusan properti bukan lagi tebak-tebakan.</p>
          </div>
          <!-- Step 4 -->
          <div class="carousel-card">
            <div class="carousel-card-image">
              <img src="https://images.unsplash.com/photo-1758523671285-9ff3f4e0ff38?auto=format&amp;fit=crop&amp;w=1200&amp;q=82" srcset="https://images.unsplash.com/photo-1758523671285-9ff3f4e0ff38?auto=format&amp;fit=crop&amp;w=640&amp;q=78 640w, https://images.unsplash.com/photo-1758523671285-9ff3f4e0ff38?auto=format&amp;fit=crop&amp;w=1200&amp;q=82 1200w" sizes="(max-width: 768px) 272px, 560px" alt="Pasangan menerima kunci rumah baru mereka" width="1200" height="800" loading="lazy" decoding="async">
              <span class="photo-context">Keputusan akhir dengan konteks yang lebih lengkap</span>
              <a class="photo-credit" href="https://unsplash.com/photos/x8l4lN6-xd0" target="_blank" rel="noopener noreferrer" aria-label="Foto pasangan oleh Vitaly Gariev di Unsplash">Unsplash · Vitaly Gariev</a>
            </div>
            <h3>4. Keputusan Mantap</h3>
            <p>Beli rumah dengan pikiran tenang. Anda tahu persis apa yang Anda beli dan lingkungan sekitarnya.</p>
          </div>
        </div>
      </section>
    <section class="section" id="contoh" style="background:#f0f6f2">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow"><span class="eyebrow-dot"></span> Contoh laporan</span>
          <h2>Bukan cuma skor. Tunjukkan apa artinya.</h2>
          <p class="lead" style="margin-inline:auto">Contoh di bawah adalah ilustrasi UI prototype, bukan hasil audit nyata.</p>
        </div>

        <div class="story-card reveal">
          <div class="story-map">
            <div class="road r1"></div><div class="road r2"></div>
            <div class="risk-zone" style="left:18%;top:42%;width:300px;height:220px"></div>
            <div class="property-marker" style="left:62%;top:44%"></div>
          </div>
          <div class="story-panel">
            <span class="story-status">Risiko sedang · perlu validasi</span>
            <h3>Grand Galaxy City</h3>
            <p class="muted">Bekasi Selatan · contoh prototype</p>

            <div class="finding">
              <b>⚠ Potensi genangan akses utama</b>
              <p>Ada indikasi area yang sebaiknya dicek langsung setelah hujan sebelum booking.</p>
            </div>
            <div class="finding">
              <b>✓ Tidak ada temuan besar pada faktor listrik tegangan tinggi</b>
              <p>Tetap validasi secara visual saat survei lapangan.</p>
            </div>
            <div class="finding">
              <b>◉ Akses kendaraan perlu dicek saat jam sibuk</b>
              <p>Perhatikan titik penyempitan dan pola keluar-masuk kendaraan.</p>
            </div>
            <div style="margin-top:auto;padding-top:22px">
              <a class="btn btn-accent" href="#cek">Coba dengan lokasi Anda <span class="arrow">→</span></a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow"><span class="eyebrow-dot"></span> Bandingkan</span>
          <h2>Masih pilih antara dua rumah?</h2>
          <p class="lead" style="margin-inline:auto">Bandingkan faktor lokasi secara berdampingan sebelum menentukan mana yang layak dikunjungi lebih dulu.</p>
        </div>

        <div class="compare-grid reveal">
          <div class="place-card">
            <span class="pill">Lokasi A</span>
            <h3 style="margin-top:16px">Grand Galaxy City</h3>
            <p class="muted">Bekasi Selatan</p>
            <div class="compare-row"><span>Risiko banjir</span><span class="badge-mid">Sedang</span></div>
            <div class="compare-row"><span>Akses</span><span class="badge-low">Baik</span></div>
            <div class="compare-row"><span>Lingkungan</span><span class="badge-low">Baik</span></div>
          </div>
          <div class="place-card">
            <span class="pill">Lokasi B</span>
            <h3 style="margin-top:16px">Kota Wisata</h3>
            <p class="muted">Cibubur</p>
            <div class="compare-row"><span>Risiko banjir</span><span class="badge-low">Rendah</span></div>
            <div class="compare-row"><span>Akses</span><span class="badge-mid">Perlu cek</span></div>
            <div class="compare-row"><span>Lingkungan</span><span class="badge-low">Baik</span></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="transparansi">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow"><span class="eyebrow-dot"></span> Transparansi</span>
          <h2>Bukan angka aja. Lihat sumber dan batasannya.</h2>
          <p class="lead" style="margin-inline:auto">Setiap temuan seharusnya bisa ditelusuri kembali ke sumber, recency, dan konteks agar Anda tahu seberapa jauh hasil bisa dipercaya.</p>
        </div>

        <div class="source-grid reveal">
          <div class="source-card">
            <div class="source-icon">⌁</div>
            <h3 style="font-size:24px">Sumber</h3>
            <p>Tampilkan asal data publik atau dataset yang dipakai pada setiap temuan, bukan sekadar skor akhir.</p>
            <div class="source-meta">Contoh UI · sumber aktual mengikuti implementasi</div>
          </div>
          <div class="source-card">
            <div class="source-icon">◷</div>
            <h3 style="font-size:24px">Recency</h3>
            <p>Berikan tanggal pembaruan agar pembeli tahu apakah informasi masih relevan untuk keputusan saat ini.</p>
            <div class="source-meta">Terakhir diperbarui · ditampilkan per faktor</div>
          </div>
          <div class="source-card">
            <div class="source-icon">i</div>
            <h3 style="font-size:24px">Batasan</h3>
            <p>Jelaskan apa yang belum bisa dipastikan dan mana yang tetap harus divalidasi melalui survei lapangan.</p>
            <div class="source-meta">Transparansi lebih penting daripada kepastian palsu</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="harga" style="background:#f1f6f3">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow"><span class="eyebrow-dot"></span> Harga</span>
          <h2>Pilih sesuai fase pencarian rumah Anda.</h2>
          <p class="lead" style="margin-inline:auto">Mulai dari satu pengecekan, lalu naik ke paket pencarian aktif ketika Anda membandingkan beberapa properti.</p>
        </div>

        <div class="pricing reveal">
          <div class="price-card">
            <h3>Cek Awal</h3>
            <p class="muted">Untuk melihat apakah lokasi layak diperiksa lebih lanjut.</p>
            <div class="price">Rp0</div>
            <ul>
              <li>1 pengecekan lokasi</li>
              <li>Peringatan keselamatan utama</li>
              <li>Ringkasan faktor lokasi</li>
            </ul>
            <a class="btn btn-ghost" href="#cek">Mulai gratis</a>
          </div>

          <div class="price-card featured">
            <span class="price-tag">Untuk 1 properti</span>
            <h3>Laporan Lengkap</h3>
            <p class="muted">Untuk properti yang sudah masuk shortlist serius.</p>
            <div class="price">Rp49.000</div>
            <ul>
              <li>Laporan bukti lebih dalam</li>
              <li>Panduan validasi lapangan</li>
              <li>Checklist pasca-kunjungan</li>
            </ul>
            <a class="btn btn-accent" href="#cek">Cek lokasi lengkap</a>
          </div>

          <div class="price-card">
            <h3>Akses 30 Hari</h3>
            <p class="muted">Untuk masa pencarian aktif dan perbandingan beberapa rumah.</p>
            <div class="price">Rp129.000 <small>/ 30 hari</small></div>
            <ul>
              <li>Hingga 5 properti</li>
              <li>Perbandingan lokasi</li>
              <li>Multi-commute & matriks perbandingan</li>
            </ul>
            <a class="btn btn-ghost" href="#cek">Pilih pass</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="faq">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow"><span class="eyebrow-dot"></span> FAQ</span>
          <h2>Pertanyaan sebelum mulai.</h2>
        </div>

        <div class="faq reveal">
          <div class="faq-item open">
            <button class="faq-q" aria-expanded="true">Apakah Rumper menggantikan survei langsung?<span aria-hidden="true">−</span></button>
            <div class="faq-a">Tidak. Rumper membantu Anda menemukan hal yang perlu diperhatikan lebih awal. Temuan tertentu tetap harus divalidasi di lapangan sebelum mengambil keputusan.</div>
          </div>
          <div class="faq-item">
            <button class="faq-q" aria-expanded="false">Wilayah mana yang tersedia?<span aria-hidden="true">+</span></button>
            <div class="faq-a">Prototype ini mengikuti scope awal Jabodetabek. Cakupan aktual nantinya bergantung pada ketersediaan data per domain.</div>
          </div>
          <div class="faq-item">
            <button class="faq-q" aria-expanded="false">Apakah Rumper menyediakan listing atau valuasi rumah?<span aria-hidden="true">+</span></button>
            <div class="faq-a">Tidak. Fokus Rumper adalah location risk intelligence dan konteks keputusan, bukan listing, valuasi, atau transaksi properti.</div>
          </div>
          <div class="faq-item">
            <button class="faq-q" aria-expanded="false">Kenapa sumber dan tanggal data penting?<span aria-hidden="true">+</span></button>
            <div class="faq-a">Karena kualitas keputusan bergantung pada transparansi. Pengguna perlu tahu dari mana temuan berasal, kapan diperbarui, dan batasan apa yang masih ada.</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="cek" style="padding-top:20px">
      <div class="container">
        <div class="final-cta reveal">
          <span class="eyebrow" style="color:#94efbf">Mulai dari rumah incaran Anda</span>
          <h2>Jangan baru tahu setelah bayar DP.</h2>
          <p>Masukkan lokasi yang sedang Anda pertimbangkan dan mulai dari pengecekan sederhana sebelum komitmen finansial berikutnya.</p>
          <form class="search-box" onsubmit="return false;">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2"/>
              <path d="m16 16 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input aria-label="Alamat atau nama perumahan" placeholder="Masukkan nama perumahan atau alamat..." />
            <button class="btn btn-accent" type="submit">Cek Lokasi <span class="arrow">→</span></button>
          </form>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="footer-inner">
      <div>© 2026 Rumper · Prototype landing page</div>
      <div>Jabodetabek · Location risk intelligence for homebuyers</div>
    </div>
  </footer>`;

export default function LandingV2() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cleanupListeners: Array<() => void> = [];

    const runScripts = () => {
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
          pill: "Risiko banjir",
          title: "Ada potensi genangan di akses utama.",
          body: "Rumper membantu menunjukkan temuan yang perlu Anda validasi di lapangan sebelum membuat komitmen finansial.",
          label: "Area terdekat",
          sub: "dari gerbang utama",
          number: "±120 m",
        },
        environment: {
          pill: "Kondisi lingkungan",
          title: "Lingkungan terlihat tenang, tapi tetap ada faktor yang perlu dicek.",
          body: "Bandingkan sinyal kualitas lingkungan, potensi gangguan, dan konteks sekitar agar survei Anda lebih terarah.",
          label: "Faktor dipantau",
          sub: "dalam area sekitar",
          number: "4",
        },
        access: {
          pill: "Akses & mobilitas",
          title: "Akses mobil terlihat cukup, tapi ada titik yang perlu diuji saat jam sibuk.",
          body: "Gunakan temuan awal sebagai panduan untuk memeriksa lebar jalan, penyempitan, dan pola keluar-masuk kendaraan.",
          label: "Lebar efektif",
          sub: "contoh prototype",
          number: "±4,8 m",
        },
        around: {
          pill: "Kelayakan sekitar",
          title: "Lihat apa yang mendukung kehidupan sehari-hari di sekitar rumah.",
          body: "Rumper menyatukan indikator sekitar agar Anda bisa menilai lokasi lebih dari sekadar tampilan rumahnya.",
          label: "Kategori sekitar",
          sub: "ditampilkan ringkas",
          number: "6",
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

      // 4. Accordion + visual orbit
      const orbit = document.getElementById("visualOrbit");
      const orbitItems = [
        document.getElementById("o1"),
        document.getElementById("o2"),
        document.getElementById("o3"),
        document.getElementById("o4"),
      ];
      const orbitSets = [
        ["Banjir", "Gempa", "Riwayat", "Drainase"],
        ["Udara", "Kebisingan", "Kontaminasi", "Ruang hijau"],
        ["Lebar jalan", "Kemacetan", "Akses mobil", "Konektivitas"],
        ["Sekolah", "Fasilitas", "Belanja", "Layanan"],
      ];
      const orbitBackgrounds = [
        "radial-gradient(circle at 22% 18%,rgba(143,201,255,.85),transparent 34%),radial-gradient(circle at 80% 18%,rgba(155,232,239,.88),transparent 32%),radial-gradient(circle at 30% 82%,rgba(185,255,98,.34),transparent 33%),linear-gradient(180deg,#cfeaff,#164d83)",
        "radial-gradient(circle at 18% 18%,rgba(183,241,212,.9),transparent 34%),radial-gradient(circle at 82% 20%,rgba(251,244,217,.9),transparent 34%),radial-gradient(circle at 30% 84%,rgba(155,232,239,.56),transparent 33%),linear-gradient(180deg,#e6f7ef,#2f7b6c)",
        "radial-gradient(circle at 18% 18%,rgba(143,201,255,.9),transparent 34%),radial-gradient(circle at 82% 18%,rgba(212,182,246,.7),transparent 34%),radial-gradient(circle at 32% 82%,rgba(251,244,217,.84),transparent 33%),linear-gradient(180deg,#dfeaff,#3b5f96)",
        "radial-gradient(circle at 18% 18%,rgba(185,255,98,.45),transparent 34%),radial-gradient(circle at 82% 18%,rgba(155,232,239,.78),transparent 34%),radial-gradient(circle at 30% 82%,rgba(251,244,217,.9),transparent 33%),linear-gradient(180deg,#eefde4,#4b8a7b)",
      ];
      document.querySelectorAll(".acc").forEach((acc, i) => {
        acc.addEventListener("click", () => {
          document.querySelectorAll(".acc").forEach((a) => a.classList.remove("active"));
          acc.classList.add("active");
          orbitItems.forEach((item, idx) => {
            if (!item) return;
            item.style.opacity = ".2";
            item.style.transform = "scale(.9)";
            setTimeout(() => {
              item.textContent = orbitSets[i][idx];
              item.style.opacity = "1";
              item.style.transform = "scale(1)";
            }, 150 + idx * 35);
          });
          if (orbit) orbit.style.background = orbitBackgrounds[i];
        });
      });

      // 5. FAQ Accordions
      document.querySelectorAll(".faq-item").forEach((item) => {
        const btn = item.querySelector(".faq-q");
        if (!btn) return;
        btn.addEventListener("click", () => {
          const wasOpen = item.classList.contains("open");
          document.querySelectorAll(".faq-item").forEach((other) => {
            other.classList.remove("open");
            const otherButton = other.querySelector(".faq-q");
            if (otherButton) {
              otherButton.setAttribute("aria-expanded", "false");
              const span = otherButton.querySelector("span");
              if (span) span.textContent = "+";
            }
          });
          if (!wasOpen) {
            item.classList.add("open");
            btn.setAttribute("aria-expanded", "true");
            const span = btn.querySelector("span");
            if (span) span.textContent = "−";
          }
        });
      });

      // 6. Search Flow with animation and real navigation to /v2/start
      document.querySelectorAll(".search-box").forEach((form) => {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const button = form.querySelector("button");
          if (button) button.click();
        });
        const button = form.querySelector("button");
        if (!button) return;
        button.addEventListener("click", () => {
          const input = form.querySelector("input");
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
                window.location.href = "/v2/start?q=" + encodeURIComponent(input.value);
              }, 300);
            }, 150);
          }, 450);
        });
      });

      // 7. Feature Carousel Observer
      const featureCarousel = document.getElementById("featureCarousel");
      if (featureCarousel) {
        const carouselObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("active");
              } else {
                entry.target.classList.remove("active");
              }
            });
          },
          {
            root: featureCarousel,
            threshold: 0.5,
          }
        );

        document.querySelectorAll(".carousel-card").forEach((card) => {
          carouselObserver.observe(card);
          card.addEventListener("click", () => {
            card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
          });
        });
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
              stack.classList.toggle("expanded");
              stack.setAttribute("aria-expanded", String(stack.classList.contains("expanded")));
            } else {
              selectCard(id);
            }
          });
          card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              const id = parseInt(card.getAttribute("data-id") || "0", 10);
              selectCard(id);
              stack.classList.add("expanded");
              stack.setAttribute("aria-expanded", "true");
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
    <div
      ref={containerRef}
      className="landing-v2-container"
      dangerouslySetInnerHTML={{ __html: LANDING_HTML }}
    />
  );
}
