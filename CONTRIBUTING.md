# Contributing

Use Node.js 22 LTS or newer. Run `npm test` before proposing a change and `npm run build` when testing Android assets. Portable tests are `tests/*.test.mjs`; machine-specific browser capture scripts stay local and untracked.

For rule changes, specify the named table preset or house variant and add an example with expected balanced settlement. Preserve existing saved-deal rules when changing defaults. Exercise multiplayer revisions, viewer privacy and non-owner permissions for online changes.

For interface changes, check small portrait and landscape screens, long names, both languages, tap alternatives to drag-and-drop and reduced motion. Update the service-worker asset list/cache for runtime asset changes.

Keep commits focused. Do not include generated bundles, APKs, SDK/tool downloads, credentials, production provider settings or player data. Read `SECURITY.md` before adding configuration.

No open-source license has been selected; contact the maintainer before reusing the application code outside this project.
