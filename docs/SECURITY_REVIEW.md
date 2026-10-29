# Release security review — 29 October 2026

Scope: version 1.6.0 client, shared-score imports, multiplayer authorization, Worker routing, Durable Object persistence/realtime, Android WebView settings and tracked-source secret checks. This is a targeted engineering review, not an independent penetration test or a claim that every vulnerability has been eliminated.

## Changes

- Deck shuffling uses cryptographic browser/server randomness; no Math.random fallback.
- Shared score rules reject markup strings, arbitrary nested objects, nonfinite numbers and prototype keys. Numeric rules cannot be interpreted as HTML through shared records or backup imports.
- Worker and coordinator request readers enforce byte limits while streaming, including requests without Content-Length. The LAN reader also limits bytes.
- Per-room serialized requests preserve optimistic revision checks across concurrent moves. Separate room objects avoid a single hot game-state object. Existing room credentials migrate without changing their code.
- WebSocket authentication uses a private seat token in the handshake protocol header, never the URL. Each outgoing snapshot uses that seat's permissions. Connections and message sizes are bounded; unsupported messages are closed. HTTP remains the only mutation path.
- Production assets include CSP, no-sniff, frame denial, no-referrer, restricted device permissions and HSTS. CORS checks remain separate from bearer authorization.
- Release Android builds block cleartext traffic and mixed content and suppress console logging. Debug builds retain LAN support and must not be submitted as production.
- Privacy is accessible in the app; public policy remains available for the Play listing. Support is hello@techwiredsolutions.com.np. The Cloudflare rule forwards incoming mail to the verified inbox; outbound sending is a separate service.
- Third-party preset branding was removed from selection and help. Historical preset IDs remain internally readable and migrate to explicit custom values, preserving saved rules.

## Verification

162 automated tests passed, including streaming limits, malicious rule payloads, legacy migration, hidden-card filtering, ownership transfer, game rules and persistence. Actual isolated workerd WebSocket integration checks passed. See CAPACITY.md for the reproducible benchmark and its limits. Source secret/artifact scanning and Android bundle verification are part of release checks.

## Remaining boundaries

Room/score codes are invitations: anyone with a valid code can join an available seat or read a shared score after joining. Use them with trusted friends. Bearer credentials stored on devices must remain private. In-memory request limits reset on eviction and are not an account-wide abuse guarantee. Offline coins can be edited by a device owner and have no cash value. There is no secure cross-device wallet or player-account identity.

Free-tier limits can cause outages under sustained traffic. Provider metrics, distributed soak testing and eventual paid capacity remain operational work. No advertising, analytics, payments or cash gambling SDK is installed. Build/deployment tooling is separate from the dependency-free runtime and must be maintained. Signing-key custody, Play Data Safety declarations and physical-device release testing remain required before submission.
