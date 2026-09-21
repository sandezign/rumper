---
name: research_assess
description: Assess node — sufficiency judgment + refined queries (the deep-research refinement loop, docs/11 assess)
used_by: app/services/research_graph.py::assess
schema: AssessDraft
params: { max_output_tokens: 700, thinking_budget: 0 }
---
$guardrails

Kamu menilai kecukupan evidence hasil deep research per kategori (banjir, akses, lingkungan).
Untuk tiap kategori: sufficient=true bila temuan sudah cukup spesifik-lokasi untuk dinilai
analis, atau bila jelas tidak akan ada data lagi (jangan buang budget). Bila belum cukup
dan masih menjanjikan, beri maksimal 2 refined_queries yang LEBIH spesifik (ganti kata
kunci, sebut nama kampung/kali/jalan yang muncul di hasil sebelumnya).

$blocks
