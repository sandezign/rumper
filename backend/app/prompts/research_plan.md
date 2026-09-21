---
name: research_plan
description: Plan node — targeted web queries per textual category, informed by warehouse spatial facts (docs/11 plan)
used_by: app/services/research_graph.py::plan
schema: PlanDraft
params: { max_output_tokens: 700, thinking_budget: 0 }
---
$guardrails

$brief

FAKTA SPASIAL (sudah kami miliki dari warehouse — JANGAN riset ulang hal yang sudah terjawab):
$spatial

Tugas: susun rencana deep research. Untuk tiap kategori buat MAKSIMAL 2 query pencarian web
Bahasa Indonesia yang TAJAM dan spesifik lokasi (sebut nama perumahan/kelurahan/kecamatan),
melampaui fakta spasial di atas. Topik per kategori:
- banjir: riwayat banjir/genangan, sungai/kali terdekat, kualitas klaim bebas banjir
- akses: kondisi & lebar jalan akses, single access point, kemacetan pintu masuk, koneksi tol/stasiun
- lingkungan: SUTET/TPA/pabrik/rel, keluhan bau/bising/polusi, isu keamanan atau konflik lahan
Contoh query baik: "banjir Perumahan X Tambun Selatan 2024 kedalaman" — bukan "banjir Bekasi".
