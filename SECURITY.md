# Security policy

This is an actively developed entertainment app. A source scan is not a security audit or a guarantee that no vulnerabilities remain.

## Report an issue

Email **hello@techwiredsolutions.com.np** with the affected version, reproduction steps and impact. Avoid including real player records, bearer tokens or signing keys. Do not publish an exploit or confidential credentials in a public issue.

## Sensitive files

Never commit provider tokens, `.env` / `.dev.vars`, Wrangler sessions, Android signing material, local SDK paths, APK/AAB outputs, user backups or exported room state. `.gitignore` excludes common patterns and the live Wrangler configuration. Check `git diff --cached` before every push; ignore rules do not remove a file that is already tracked.

If a real secret is committed, revoke/rotate it first, then remove it from history as appropriate. Deleting the latest copy alone does not revoke a credential.

## Trust model and limitations

- Coins/chips have no cash value. Local storage and offline balances can be modified by the device owner.
- Room codes and shared-score links are invitations intended for trusted friends. A six-digit code is not strong authentication for confidential data.
- Seat tokens authorize moves/ownership; keep them private and use HTTPS online. Do not log Authorization headers or tokens.
- Server validation, hidden-hand filtering, revision checks and request limits reduce abuse; tests cover selected boundaries, not every attack.
- CORS is a browser policy, not a substitute for server authorization. Add only necessary deployment origins.
- The Node server is for development/LAN use and loses state at restart. Review proxy exposure and operational controls before hosting publicly.
- Debug builds are debuggable and use a conventional debug key. Do not distribute them as production releases.

The core app has no npm runtime dependencies. Deployment/build tools still need updates and independent vulnerability review. The bundled font's license is preserved in `web/fonts/OFL.txt`.
