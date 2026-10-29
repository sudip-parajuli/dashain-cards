# Capacity assessment — 29 October 2026

Version 1.6.0 separates rooms and shared score records into individual Durable Objects. Authenticated hibernating WebSockets push private, viewer-filtered snapshots. Polling remains a fallback, with hidden tabs paused. Reads persist activity no more than once per minute; moves persist immediately. Existing codes migrate lazily from the previous singleton.

## Measured checks

`node scripts/benchmark-rooms.mjs` creates 250 four-player Jutpatti rooms (1,000 seats) and performs 3,000 reads in ten batches of 300 concurrent requests. On the development machine: zero errors, p50 24.96 ms, p95 40.91 ms, p99 42.51 ms; no writes during the read burst. This is an in-process Node benchmark, excluding Internet latency, edge scheduling, storage latency and full-game duration. It is not a production capacity guarantee.

`node scripts/check-realtime.mjs` against isolated Wrangler/workerd verifies real WebSocket upgrades, hand privacy, score push, viewer permissions and concurrent move conflicts. It creates only disposable local rooms. Reproduce with Wrangler local development on port 4299, then run the script. Do not load-test production using these scripts.

## Free-tier budget

Cloudflare currently includes 100,000 Durable Object requests/day, 13,000 GB-s duration/day, 100,000 SQLite rows written/day and 5 million rows read/day. Requests include HTTP, internal calls and alarms; storage operations can account for more than one row. These limits are account-wide and independent of registered player count. Exceeding a free limit causes operations to fail until reset. See [official pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) and [limits](https://developers.cloudflare.com/durable-objects/platform/limits/).

The old 1.5-second polling would generate 240,000 requests/hour for 100 clients. Real-time connections remove that idle polling, but moves, joins, reconnects, migration, alarms and fallback polling still consume quota. For example, 25 tables making one move every two seconds generate roughly 45,000 move requests/hour before other overhead. Sustained hundreds of active players can exceed free allowances. More than 1,000 occasional players is different from 1,000 simultaneous active players.

Before public promotion, watch Cloudflare Workers/DO usage and errors daily. Upgrade before sustained traffic approaches 70% of any daily budget, and repeat a distributed staging soak test with full games, reconnect storms and mobile devices. No paid plan was enabled. Application logs remain disabled to avoid logging private credentials; use aggregate provider metrics. The legacy singleton still handles a small creation/join gate and migration, so measure its request rate too.

Six-digit invitations and best-effort in-memory rate limits suit trusted friend groups. They are not comprehensive DDoS protection or private account authentication. The offline coin wallet is not a secure financial ledger.
