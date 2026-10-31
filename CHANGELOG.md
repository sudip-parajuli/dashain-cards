# DashainCards – Changelog

All notable changes to this project are documented here in reverse-chronological order.

---

## [Unreleased] – 2026-10-31 (session 3)

### Fixed / Improved

#### Jutpatti – Win celebration shows sorted card fan (not grouped lines)
- Winning cards are now displayed as a single overlapping fan (sorted by rank),
  identical to how cards appear in the hand area — not split into "Pair" / "Single" rows.


### Redesigned – Game Tile Grid (Home Screen)
- **3-column grid** on desktop (≥720px), **2-column** on mobile (400–720px), **1-column** on ≤400px
- **Navy header** per tile matching the hero section gradient (`#1b2a5c → #2a3d88`) with subtle dot pattern and decorative ring
- **Playing card fan** inside each header — game-specific cards:
  - Marriage: A♥ A♦ A♣ (3-card fan)
  - Call Break: A♠ A♥ A♦ A♣ (4-card fan)
  - Dhumbal: A♠ 2♦ 2♥ (3-card fan)
  - Dahar Mara: 10♠ 10♥ 10♦ 10♣ (4-card fan)
  - Faras: A♠ K♥ Q♦ (3-card fan)
  - Jutpatti: A♥ A♦ K♠ K♣ 7♦ (5-card fan)
  - Kitti: 9 cards spread across 3 groups (9-card fan)
- **Rules "?" button** restored — top-right corner of each tile (white circle, overlays header)
- **Tile entrance animation** staggered slide-up with `.gtile:nth-child` delays
- **Suit icon badge** retained in tile body beside game name

#### Marriage – Win celebration includes maal (point) card
- The maal/tip card (`g.tip`) is now shown first in the victory panel,
  followed by exposed melds, then remaining hand cards.

#### Faras – Multiple UI fixes
- The three hand cards are always on **one line** (no wrapping).
- Action buttons no longer overflow screen edges; button background now fully covers the button label text.
- The in-game card showdown overlay no longer blocks the "Round Result" and "New Deal" buttons
  (pointer-events isolation applied to `.faras-showdown`).
- All players' hands shown in win panel (not winners only); winner highlighted with ★.

#### Game State Persistence – Resume Any Game
- Every game's state is **auto-saved** to `localStorage` when the player leaves
  (navigates home or starts a different game).
- `db.saves` map stores one save slot per game type.
- **Home screen** shows "▶ Resume [Game Name]" for each game with an active save.
- Each **game tile** shows "▶ Resume" or "▶ Play" depending on save existence.
- Starting a new game when a save exists **warns the player** and offers to resume.
- `clearall` (reset) also clears all saves.

### Files Changed (session 3)
| File | What changed |
|------|-------------|
| `web/table-experience.js` | Jutpatti fan (sorted, single row); Marriage maal card added; Faras shows all players with ★ winner highlight |
| `web/table-experience.css` | Faras hand no-wrap; button sizing fix; showdown pointer-events isolation |
| `web/app.js` | `db.saves` map; `beginBot` saves game on switch; `resume` supports `data-game`; `home()` Resume buttons per game; `validDb` migration |

---

## [Unreleased] – 2026-10-31 (session 2)

### Added

#### Win Celebration – Full-Screen Fireworks & Winner Cards
- When a player wins a round, the **entire screen is covered with continuous fireworks**
  (animated sparks in 6 colours, 14 burst positions) until the win dialog is dismissed.
- **Firecracker sounds loop continuously** (every ~1.8 s) using the existing synthesised
  firecracker buffer in `audio.js`, stopping the moment the dialog closes.
- A **winner cards panel** (`.victory-cards`) is injected into the celebration dialog
  above the action buttons, styled as mini playing cards with red/black colouring.
- **Game-specific card displays:**
  | Game | What is shown |
  |------|--------------|
  | Jutpatti | Winner's full hand as a card fan |
  | Marriage | Exposed melds + maal card + remaining hand |
  | Dhumbal | The called hand |
  | Kitti | All three showdown sets labelled "Set 1 / 2 / 3" |
  | Callbreak / Dahar Mara | All winning players' hands labelled by player name |
  | Faras | All players' hands; winner highlighted with ★ |

### Files Changed (session 2)
| File | What changed |
|------|-------------|
| `web/table-experience.js` | `celebration()` rewritten — full-screen overlay + looping firecracker audio; `celebrationDialog()` receives `onDialogClose` callback; new `buildWinnerCards()` function |
| `web/table-experience.css` | `.fireworks-overlay` + `@keyframes fw-burst`; `.victory-cards`, `.vc-group`, `.vc-card`, `.vc-label` styles |

---

## [Unreleased] – 2026-10-31 (session 1)

### Added
- **CHANGELOG.md** – this file, tracking every change going forward.

### Changed

#### Layout – Action Buttons in Hand Area (few-card games)
- For games with few cards in hand (`short-hand` class, ≤ 9 cards), the action
  buttons (Continue opponents, Call Jhyap, Declare Jut, etc.) are now rendered
  **inside the hand area** instead of the separate `table-controls` rail.
  - **Portrait mode** – buttons appear below the card fan, centred.
  - **Landscape mode** – buttons appear to the right of the card fan, stacked vertically.
- For games with many cards in hand, buttons remain in the right-hand
  `table-controls` column as before.

#### Layout – Turn Banner & Hint Text
- The "You · Your turn" turn banner is now displayed **centred** in the
  `table-status` area.
- The hint/message text (e.g. "Build three pure melds or seven exact pairs…")
  is shown on its own line **below** the banner, with appropriate spacing.

#### Layout – Table Middle Centering
- The `table-middle` section uses full available width with equal left/right
  margins so the felt background and card zones are always centred on screen.

#### Dhumbal – Landscape Fan Layout
- In landscape mode, Dhumbal cards in hand are now displayed as a **tightly
  overlapping fan** (same style as Jutpatti), mirroring how a hand is held in real life.

#### Kitti – Landscape Text Overlap Fix
- Added `line-height` and `margin` spacing to Kitti landscape layout so that
  text labels no longer overlap on small/mobile screens.

#### Kitti – Salami (All-Three-Sets Win) Pays Double
- When a player wins **all three showdown sets** (Salami), every other player
  pays **double** the normal amount.
- `resolveKitti` in `games.js` sets `g.scores[winner] = 2` and `g.salami = true`.
- `gameTransfers` in `game-economy.js` detects the salami flag and doubles payments.

### Files Changed (session 1)
| File | What changed |
|------|-------------|
| `web/table.js` | `inline-action-hand` class; `table-hint` span below turn banner |
| `web/table-experience.css` | Dhumbal landscape fan; Kitti landscape line-height fix; table-status flex-column centering; fireworks + victory-cards CSS |
| `web/table-responsive.css` | Status row `minmax(28px,48px)`; turn-banner `display:inline-block` |
| `web/games.js` | Kitti Salami: `g.scores[winner]=2`, `g.salami=true` |
| `web/game-economy.js` | `gameTransfers`: detects salami and doubles payments |

---
