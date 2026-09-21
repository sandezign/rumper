---
name: research_search
description: Search node — one grounded (Google Search) query for a category (docs/11 search)
used_by: app/services/research_graph.py::search
grounded: true
params: { max_output_tokens: 1100, thinking_budget: 0, timeout_s: 40 }
---
$guardrails

Riset web untuk kategori $category: $query
Laporkan RINGKAS (maks ~250 kata) temuan faktual dengan tahun/angka bila ada; jujur bila tidak ada hasil.
