# Call Break matches

Bot and friends play use one match across five rounds by default. An intermediate round does not settle coins or show a match-winner celebration. The host (or local player) deals the next round after reviewing the round-points popup. The dealer advances each round. Three players remove 2 of hearts and receive 17 cards; four receive 13.

These are the project's selected house defaults, not a claim that every Call Break table uses them. Change them in Game settings or the friends-room rules before starting a match. Changes to defaults apply to the next match.

| Rule | Default |
| --- | --- |
| Match length | 5 rounds |
| First runner-up payment | 50 coins/chips |
| Second runner-up payment | 100 |
| Last-place payment | 150 |
| Winner's total strictly above 20 | Double each rank payment |
| Runner-up has a negative final total | Double that player's rank payment |
| Both doubles apply | Double only once; stacking is optional |
| Successful bid of 8 (at least 8 tricks) | End match; each opponent pays 100 |
| Failed bid of 8 | End match; caller pays each opponent 100; round score is -8 |
| Every player has failed a bid at least once in this attempt | No payout; restart a fresh attempt with the same stakes |
| Overtricks | 0.1 per extra trick |

An 8-call resolves after that round's tricks have been completed and takes priority over the all-circle restart. Only one 8-call is accepted in a round to avoid contradictory simultaneous sudden-death settlements. The final user-selected default ends the match on failure; it does not use the alternative continue-playing/reverse-rank rule.

For a normal finish, equal highest totals share the collected prize. Tied losing ranks average the payment positions they occupy. For example, totals 18/12/12/2 give transfers +300/-75/-75/-150. Three-player rank matches use 50/100; the separately editable 8-call payment still applies per opponent.

The maximum configured liability is reserved once for a bot match and refunded with the final net transfer. A 50/100/150 four-player match with doubles applied once reserves 300, covering either the largest doubled rank payment or a failed 8-call. Balances do not change between ordinary rounds or a circle restart. Friends must fund that maximum liability before starting, so normal settlement is not silently reduced by insufficient chips. Existing saved legacy single-deal games retain their previously agreed settlement; new matches use these rules.

The round-points popup shows each round's points, call/tricks, cumulative totals, restarts and final transfers. Completed local match details are retained with the saved History record.

## Verification

Run `npm test` for match, wallet, privacy and rule tests. Against an isolated local Wrangler runtime, run:

```sh
node scripts/check-callbreak-match.mjs http://127.0.0.1:4299/dashaincards
```

The script refuses production targets. It plays all five rounds through the actual worker, checks concealed hands and unchanged intermediate balances, and verifies one balanced final settlement.
