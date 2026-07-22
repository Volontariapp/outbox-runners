## Outbox runners — processus démons "Lean Mode"

N'implémente pas la logique Outbox elle-même (elle vit dans `@volontariapp/outbox` sous `npm-packages`) : ce repo n'est qu'une couche d'infrastructure exécutive, en pur Node.js (pas de NestJS) pour minimiser cold start et RAM.

Un sous-dossier isolé par domaine — `outbox-post`, `outbox-user`, `outbox-social`, `outbox-event` — chacun poll sa table (`jobs_outbox` / `event_outbox`) avec `FOR UPDATE SKIP LOCKED` puis dispatch vers BullMQ (jobs) ou un Redis Stream (events). Voir `ARCHITECTURE.md` pour le diagramme de séquence complet.

Toute modification du polling ou du verrouillage doit préserver la garantie *at-least-once* sans double publication en cas de scaling horizontal — voir `.agents/skills/global/trace-async-flow/SKILL.md` (racine `meta`) pour la vue d'ensemble du flux à travers `workers-runners` et `post-processors-runner`.

## 🚀 RTK - Rust Token Killer (Optimized)
All shell commands (`git`, `npm`, `jest`, etc.) are automatically proxied via `rtk` for 80% token savings.
- **Direct Usage:** `rtk gain` (analytics), `rtk discover` (missed savings).
- **Files:** Use `rtk read <file>`, `rtk ls`, `rtk find`, `rtk grep` for compressed agent output.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
