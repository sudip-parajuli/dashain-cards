# DashainCards – Changelog

All notable changes to this project are documented here in reverse-chronological order.

---

## [Unreleased] – 2026-10-31 (session 3)

### Added

#### Game State Persistence – Resume Any Game
- Every game's state is **auto-saved** to `localStorage` when the player leaves
  (navigates home or starts a different game).
- `db.saves` map stores one save slot per game type (7 slots total).
- **Home screen** shows "▶ Resume [Game Name]" hero button for the most recently active game.
- Each **game tile** shows "▶ Resume" or "Play" depending on whether a save exists.
- Starting a new game when a save exists **warns the player** and offers to resume instead.
- `clearall` (Reset chips) also wipes all saves.

#### Home Screen – Game Tile Grid Redesign (v3)
- **3-column grid** on desktop (≥720px), **2-column** on mobile (400–720px), **1-column** on ≤400px.
- **Navy header** per tile — `linear-gradient(150deg, #1b2a5c → #2a3d88)` matching the hero section,
  with a subtle radial dot pattern and white ring accent.
- **Playing card fan** rendered inside each header using actual game card components:

  | Game | Cards shown | Fan type |
  |------|-------------|----------|
  | Marriage | Q♠ Q♥ Q♦ *(Putali / Joker Tannela)* | 3 Joker cards |
  | Call Break | A♠ A♥ A♦ A♣ | 4-card fan |
  | Dhumbal | A♠ 2♦ 2♥ | 3-card fan |
  | Dahar Mara | 10♠ 10♥ 10♦ 10♣ | 4-card fan |
  | Faras | A♠ K♥ Q♦ | 3-card fan (A-K-Q sequence) |
  | Jutpatti | A♥ A♦ K♠ K♣ 7♦ | 5-card fan (two pairs) |
  | Kitti | A♠A♥A♦ · 7♣8♣9♣ · 2♦6♦J♦ | 9-card spread (Trial · Sequence · Jutt) |

- **Marriage Joker card** (`.gtile-jkr`): custom card with `🃏` emoji face and "JOKER"
  written vertically in red — rendered as three Joker Tannela cards in the fan.
- **Rules "?" button** — gold circle (`#f5c842`), bold navy `?`, white border, drop shadow;
  placed as a direct child of `.gtile-header` (top-right corner, z-index:10) so it is
  always visible above the navy header regardless of card fan.
- **Tile entrance animation** — staggered slide-up (`tile-enter` keyframe) with
  `.gtile:nth-child(n)` delays (50ms per tile).
- **Suit icon badge** retained in tile body alongside game name and Nepali name.

### Fixed / Improved

#### Jutpatti – Win celebration shows sorted card fan
- Winning cards displayed as a **single overlapping fan** (sorted by rank),
  identical to the hand area — not split into "Pair" / "Single" rows.

#### Marriage – Win celebration includes maal (point) card
- The maal/tip card (`g.tip`) is shown first in the victory panel,
  followed by exposed melds, then remaining hand cards.

#### Faras – Multiple UI fixes
- The three hand cards always stay on **one line** (no wrapping) via `overflow:visible`
  on `.game-faras .hand-area` and card width constrained to `min(70px, (100vw-270px)/3)`.
- Cascading fan (overlapping) layout preserved — the flat row was reverted per user request.
- Action buttons no longer overflow screen edges on small phones.
- Button backgrounds fully cover their text labels.
- The in-game showdown overlay no longer blocks "Round Result" / "New Deal" buttons.
- All players' hands shown in the win panel (not winners only); winner highlighted with ★.

### Deployed

- **GitHub**: pushed to `main` — commit `c71712a`
  ([sudip-parajuli/dashain-cards](https://github.com/sudip-parajuli/dashain-cards))
- **Cloudflare**: deployment pending API token — dry-run passed (50 files, 104 KiB)

### Files Changed (session 3)
| File | What changed |
|------|-------------|
| `web/app.js` | `db.saves` map; `beginBot` saves on switch; `resume` uses `b.dataset.game`; `home()` Resume buttons; game tile HTML restructured — `.gtile-header` now contains card fan + rules button; Marriage uses Joker `{r:0}` sentinel; `TC.kitti` = Trial+Sequence+Jutt; Jutpatti 5-card fan |
| `web/club.css` | Full tile redesign: navy gradient header, card fan positioning (`:has()` nth-child), 3-col/2-col/1-col grid, `.gtile-jkr` joker card, rules button gold style, staggered entrance animation |
| `web/table-experience.js` | Jutpatti sorted fan; Marriage maal card; Faras all-players win panel |
| `web/table-experience.css` | Faras hand `overflow:visible`; fireworks overlay; victory-cards panel |
| `web/table-responsive.css` | Status row `minmax`; turn-banner `inline-block` |
| `web/table.js` | `inline-action-hand` class; `table-hint` span |
| `web/games.js` | Kitti Salami double pay |
| `web/game-economy.js` | Detects salami flag, doubles transfers |
| `CHANGELOG.md` | This file |

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
| `web/table-experience.js` | `celebration()` rewritten — full-screen overlay + looping firecracker audio; `celebrationDialog()` receives `onDialogClose` callback; new `buildWinnerCards()` |
| `web/table-experience.css` | `.fireworks-overlay` + `@keyframes fw-burst`; `.victory-cards`, `.vc-group`, `.vc-card`, `.vc-label` styles |

---

## [Unreleased] – 2026-10-31 (session 1)

### Added
- **CHANGELOG.md** — this file, tracking every change going forward.

### Changed

#### Layout – Action Buttons in Hand Area (few-card games)
- For games with few cards in hand (`short-hand` class, < 9 cards), the action
  buttons (Continue opponents, Call Jhyap, Declare Jut, etc.) are now rendered
  **inside the hand area** instead of the separate `table-controls` rail.
  - **Portrait mode** — buttons appear below the card fan, centred.
  - **Landscape mode** — buttons appear to the right of the card fan, stacked vertically.
- For games with many cards in hand, buttons remain in the right-hand
  `table-controls` column as before.

#### Layout – Turn Banner & Hint Text
- The "You · Your turn" turn banner is now displayed **centred** in the `table-status` area.
- The hint/message text is shown on its own line **below** the banner, with appropriate spacing.

#### Layout – Table Middle Centering
- The `table-middle` section uses full available width with equal left/right margins.

#### Dhumbal – Landscape Fan Layout
- In landscape mode, Dhumbal cards in hand are now displayed as a **tightly
  overlapping fan** (same style as Jutpatti), mirroring how a hand is held in real life.

#### Kitti – Landscape Text Overlap Fix
- Added `line-height` and `margin` spacing so text labels no longer overlap on small screens.

#### Kitti – Salami (All-Three-Sets Win) Pays Double
- When a player wins **all three showdown sets** (Salami), every other player pays **double**.
- `resolveKitti` in `games.js` sets `g.scores[winner] = 2` and `g.salami = true`.
- `gameTransfers` in `game-economy.js` detects the salami flag and doubles payments.

### Files Changed (session 1)
| File | What changed |
|------|-------------|
| `web/table.js` | `inline-action-hand` class; `table-hint` span below turn banner |
| `web/table-experience.css` | Dhumbal landscape fan; Kitti landscape line-height fix; table-status flex-column centering |
| `web/table-responsive.css` | Status row `minmax(28px,48px)`; turn-banner `display:inline-block` |
| `web/games.js` | Kitti Salami: `g.scores[winner]=2`, `g.salami=true` |
| `web/game-economy.js` | `gameTransfers`: detects salami and doubles payments |

---
