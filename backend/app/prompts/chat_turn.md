---
name: chat_turn
description: Per-turn assembly — system rules + optional QA block + intake status + conversation window
used_by: app/services/chat_graph.py::turn
---
$system
$qa_block
$focus

=== PROFIL PENGGUNA (dari percakapan sebelumnya) ===
$user_profile

=== STATUS INTAKE ===
$intake_status

=== PERCAKAPAN ===
$conversation

Balas pesan user terakhir sebagai asisten (field reply) + field terstruktur lain.
