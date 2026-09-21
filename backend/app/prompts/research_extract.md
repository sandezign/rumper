---
name: research_extract
description: Extract node — structured findings with index-based citations from all accumulated notes (docs/11 extract)
used_by: app/services/research_graph.py::extract
schema: CategoryDraft
params: { max_output_tokens: 2200, thinking_budget: 256 }
---
$guardrails

Hasil deep research kategori "$category" (beberapa ronde pencarian) dan fakta spasial warehouse.
Ekstrak findings terstruktur; tiap finding mengutip source_indices yang benar-benar mendukung
(kosong = evidence gap). Jangan duplikasi fakta spasial berikut (sudah dicatat terpisah):
$spatial

Usulkan proposed_score 0-100 (anchor: 80-100 mendukung; 65-79 cukup; 50-64 perlu perhatian;
25-49 risiko tinggi; 0-24 red flag kritis), mempertimbangkan SEMUA temuan + fakta spasial.

=== HASIL RISET ===
$research_text

=== DAFTAR SUMBER ===
$source_list
