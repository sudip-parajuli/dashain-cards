# Dashain Cards

Seven Nepali card games, one place to play and keep score. Built around the Dashain tradition of gathering around a table, with English and Nepali interfaces, offline bot games, online friends rooms and shared live scorekeepers.

**[Try the live app](https://www.techwiredsolutions.com.np/dashaincards)** · Version 1.4.0 · Android companion app in development

![Marriage in landscape](docs/screenshots/landscape.png)

[View the phone homepage](docs/screenshots/home.png)

## Engineering focus

The project combines reusable rules engines with browser-local play and a
server-authoritative friends-room service. Important boundaries include legal
moves, concealed opponent cards, reconnect/state handling and configurable house
rules. Read [architecture](docs/ARCHITECTURE.md) for those decisions and
[Android setup](docs/ANDROID.md) for the development companion's current scope.

## Games and features

| Game | Players | Play and scoring |
| --- | --- | --- |
| Marriage | 2–5 | Melds, dublees, public tunnelas, editable maal rules and explained round settlements |
| Call Break | 3–4 | Calls, legal trick play and scorekeeping; three players remove 2♥ |
| Dhumbal | 2–5; 6–7 as a house variant | Draw/discard, matching sets, optional runs and Jhyap |
| Dahar Mara | Exactly 4 | Two teams, trump, captured tens and kot scorekeeping |
| Kitti | 2–5 | Three private hands, showings and configurable winning rules |
| Faras | 2–17 | Blind/seen play, bets, raises, pack, show and carried virtual chip balances |
| Jutpatti | 2–6 | Pairs, optional wild cards and Jut declarations |

- Six-digit friends rooms for every game, with server-authoritative turns and concealed opponent hands.
- Shared score links: guests can read; the owner edits and can transfer ownership.
- Configurable house rules, point values and coin rates. Rule variants are labelled rather than presented as a universal ruleset.
- Offline bot play, saved games, local history and JSON backups.
- Game-specific virtual coin settlement; chips cannot be bought or redeemed for money.
- Portrait/landscape tables, drag-and-drop, tap alternatives, card movement and reduced-motion support.
- An Android WebView wrapper serving bundled assets through Android's app-assets origin.

## Run locally

Install Node.js 22 LTS or newer. The web app, local server and automated tests have no npm runtime dependencies.

```sh
git clone https://github.com/sudip-parajuli/dashain-cards.git
cd dashain-cards
npm start
```

Open **http://localhost:4173**. This serves the web frontend; its default friends endpoint is the live service. For isolated local multiplayer, use the local room server instead:

```powershell
# PowerShell
$env:LOCAL_ROOM_SERVICE='1'
$env:HOST='127.0.0.1'
node server/start.mjs
```

```sh
# macOS / Linux
LOCAL_ROOM_SERVICE=1 HOST=127.0.0.1 node server/start.mjs
```

Open **http://localhost:4174**. Use independent browser profiles/devices to create and join a test room. The development server stores rooms in memory; restarting it removes them. See [deployment](docs/DEPLOYMENT.md) for LAN and Internet hosting.

## Test and build

```sh
npm run security:check
npm test
npm run build
```

The current suite contains 145 tests covering rules, settlements, hidden-card boundaries, stale actions, live scores, durable restarts and animation transitions. Building copies `web/` to `dist/` and the Android assets folder; generated copies are intentionally untracked.

See [Android setup](docs/ANDROID.md) for the debug APK, and [architecture](docs/ARCHITECTURE.md) for the project structure.

## Project layout

```text
web/                  UI, rules engines, offline storage and service worker
server/               Local HTTP server, rooms and shared score records
deploy/cloudflare/    Worker router and durable room coordinator
android/              Android WebView host and resources
scripts/              Preview, asset build and debug APK packaging
tests/                Portable Node regression tests and APK asset verifier
docs/                 Architecture, deployment and Android guides
```

## Current limits

The Android app is a development build, not a published Play Store release. Physical-device lifecycle and accessibility testing remain ongoing. Bots use simple strategies. Faras sideshows and longer Marriage opening sequences are not implemented. Online seats wait for disconnected players; there is no automatic bot takeover. Rooms and score links are intended for trusted friends, not sensitive records or cash play. Offline coins and records are device-local and can be changed by the device owner.

## Contributing, security and licenses

Read [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md) and [third-party notices](THIRD_PARTY_NOTICES.md). No open-source license has been selected for the application code; public visibility alone does not grant reuse rights. The bundled Baloo 2 font retains its SIL Open Font License.

Built by **Sudip Parajuli / Techwired Solutions**. Support: s.techwired@gmail.com.
