# Deployment

## Local and LAN

The frontend preview listens on `127.0.0.1:4173`. For a complete local app and isolated room API:

```powershell
$env:LOCAL_ROOM_SERVICE='1'
$env:HOST='127.0.0.1'
$env:PORT='4174'
node server/start.mjs
```

For deliberate LAN testing, set `HOST=0.0.0.0` and allow only your trusted private network through the firewall. Other devices use the host's LAN address and port. Use HTTPS for Internet traffic; the local server is a development server with in-memory rooms.

`LOCAL_ROOM_SERVICE=1` injects the local endpoint before startup. `web/room-service.js` otherwise points to the published app. Change that public URL when deploying your own independent service; it must never contain a credential.

## Cloudflare Workers

1. Install an official Wrangler CLI and authenticate with your Cloudflare account. Keep OAuth state and API tokens outside the repository.
2. Copy `deploy/cloudflare/wrangler.example.jsonc` to `deploy/cloudflare/wrangler.jsonc` (ignored).
3. Set your worker name and allowed frontend origins. Wrangler can select your account interactively; an account ID, if needed, belongs in the local copy.
4. Inspect a dry run, then deploy:

```sh
wrangler deploy --dry-run --config deploy/cloudflare/wrangler.jsonc
wrangler deploy --config deploy/cloudflare/wrangler.jsonc
```

Keep the Durable Object class, binding and migrations consistent with an existing deployment. Do not point experimental code at production storage. A separate worker name gives development deployments separate storage. This repository does not auto-deploy to production.

The Worker serves both assets and API under `/dashaincards`. Update `web/room-service.js` to the URL you publish. If using the Android wrapper, allow its app-assets origin in CORS as required. The existing worker router includes that app origin handling; inspect it before changing the allowlist.

## Existing website under a path

Merge the example redirects/rewrites in `deploy/cloudflare/vercel-rewrites.example.json` into the parent site's Vercel configuration, replacing its worker hostname. Preserve all unrelated website routes. The redirect gives relative assets the trailing slash they need. No DNS change is required for a path under an existing domain.

## Alternative Node hosting

`Dockerfile` serves the Node app at port 4174; set `LOCAL_ROOM_SERVICE=1` when serving the frontend from that same host. `render.yaml` and `deploy/Caddyfile` are optional examples, not the current production infrastructure. Configure your own origins/domain and TLS. Node rooms are lost on restart; use the durable Cloudflare backend for persisted sessions.

## Release checks

- Run `npm test` and check portrait/landscape in English and Nepali.
- Verify independent clients cannot read concealed hands or edit another owner's score record.
- Increment the service-worker cache for asset changes; check once after the new worker activates.
- Run `npm run build` and the Android asset verification when packaging Android.
- Check the published `/dashaincards/` and `/dashaincards/api/health` endpoints and create a disposable test room.
- Review the staged diff for provider configuration, credentials, backups or signing material before pushing.
