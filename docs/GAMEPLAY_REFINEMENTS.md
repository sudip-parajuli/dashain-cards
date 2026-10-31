# Gameplay refinements — 31 October 2026

## Hand arrangement and Marriage

Every game permits dragging uncommitted cards within the hand, including while waiting for another player. Manual order persists through renders and online snapshots; newly drawn cards are appended. Choose Sort hand (or a Marriage sort-mode toggle) to resume automatic arrangement. Committed Kitti sets remain grouped. Rearrangement is local presentation and never changes server ownership, turns or meld rules.

Marriage bots retain visible Putali, Master and Superman cards even before seeing maal. They do not use the concealed maal to evaluate ordinary wildcards before earning access to it. A special card can only be discarded as a last resort when no lower-valued legal discard exists.

## Dhumbal

New games use a standard deck, five-card hands, Ace 1, Jack 11, Queen 12 and King 13. Discard first: one card, a same-rank set, or a same-suit consecutive run of at least three. Ace is low in a run. Then draw exactly one card. A discard-pile pickup is locked until that player has shed a set/run or already holds fewer than five cards. Pickup takes one top card from the previous dump, never the cards just discarded during this turn. This follows the one-card replacement rule; it does not pick up an entire packet. Call Jhyap at the start of the turn before discarding. Face values, runs and call/penalty settings remain editable. Existing saved draw-first games retain their turn order.

## Dahar Mara

Exactly four seats, opposite partnerships and thirteen cards each. Trump is random at deal by default, with fixed suit and first-off-suit variants available. Follow suit. The same individual must win successive tricks to collect the accumulated middle; a partner's win does not qualify unless the optional team-capture rule is enabled. The last trick sweeps the remainder. Three or four tens wins; two tens each is resolved by actual tricks won. All four tens is Kot. No forced humorous/dealer penalty is imposed. Previously saved partial-deal Dahar games retain the legacy tie-break because their earlier trick winners were not recorded; start a new deal for the new rules.

Team colours identify partners. The muted trump suit remains on the felt; seats show secured team tens and card counts. Collection flights run only when the middle pile is secured, not on every single trick. The centre counter shows uncollected cards.

## Faras and celebrations

Chips sit on the left of the hand, with a spaced circular action cluster on the right and cards centred between balanced columns on wide screens. Pack animates three card backs to the centre. Showdown reveals active hands in table order starting at the requesting player; automatic shows start at the current player. Folded hands are excluded from the on-table reveal.

All games present fireworks on the table before the detailed result popup. Faras reveals and trick collections finish first. Muting/effect preferences are respected, reduced motion uses a brief static treatment, and reopening scores does not replay the celebration.

## Verification

190 automated tests cover card conservation, discard-source restrictions, suited runs, bot turns, consecutive collection, final sweeps, both-team tie-break outcomes, manual ordering, Marriage special-card retention, multiplayer privacy and persisted room state. Browser verification covers in-hand dragging, four-side seating and Faras pack flights. Test on a physical Android device before public release.
