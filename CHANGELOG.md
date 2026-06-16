## [1.2.1](https://github.com/tbusser/vueminos/compare/v1.2.0..v1.2.1) - 2026-06-16

### 🐛 Bug Fixes

- *(useRoundsLogic)* Convert PlayerIdNotFoundError into failure feedback
- *(useCollectPoints)* Replace unsafe cast with type guard for leftover points ([#91](https://github.com/tbusser/vueminos/pull/91))
- *(types)* Remove spurious roundId from ScoredTurnInput and TurnInput ([#92](https://github.com/tbusser/vueminos/pull/92))
- *(NumberSpinner)* Replace hardcoded aria-label with valueLabel prop ([#93](https://github.com/tbusser/vueminos/pull/93))
- *(SettingsPanel)* Bind v-models directly to store refs ([#94](https://github.com/tbusser/vueminos/pull/94))
- *(useRounds)* Return Feedback from advanceToNextPlayer instead of void
- *(i18n)* Correct Dutch translation for turnNotFound error ([#100](https://github.com/tbusser/vueminos/pull/100))
- *(NumberPad)* Make event delegation robust and add missing button types ([#101](https://github.com/tbusser/vueminos/pull/101))
- *(i18n)* Derive locale validation from canonical source of truth ([#106](https://github.com/tbusser/vueminos/pull/106))
- *(BottomSheet)* Reset global ref on unmount to prevent stuck scroll ([#110](https://github.com/tbusser/vueminos/pull/110))
- *(RoundView)* Check Feedback from all composable calls ([#121](https://github.com/tbusser/vueminos/pull/121))

### 💼 Other

- *(tsconfig)* Include service worker in compilation and reformat include array

### 🚜 Refactor

- *(test-factories)* Remove redundant id variable in addNewPlayersStore ([#90](https://github.com/tbusser/vueminos/pull/90))
- *(useRounds)* Merge useRoundManager and useRoundsLogic into a single composable ([#99](https://github.com/tbusser/vueminos/pull/99))
- *(RoundView)* Replace watchEffect with explicit watch for turn key ([#102](https://github.com/tbusser/vueminos/pull/102))
- *(PointsBottomSheet)* Replace close event with save and remove v-model ([#109](https://github.com/tbusser/vueminos/pull/109))
- Replace "stone" with "tile" across the codebase ([#111](https://github.com/tbusser/vueminos/pull/111))
- *(types)* Consolidate ScorePerPlayer and LeftoverPoints into P… ([#112](https://github.com/tbusser/vueminos/pull/112))
- *(types)* Convert global type declarations to explicit exported types ([#113](https://github.com/tbusser/vueminos/pull/113))
- *(usePlayerManager)* Return Feedback from addNewPlayer ([#114](https://github.com/tbusser/vueminos/pull/114))
- *(useRounds)* Surface game-over signal from finishCurrentRound ([#122](https://github.com/tbusser/vueminos/pull/122))
- *(layout)* Collapse layout state singletons into a Pinia store ([#123](https://github.com/tbusser/vueminos/pull/123))

### 📚 Documentation

- *(BottomSheet)* Tighten onUnmounted comment
- *(rules)* Add domain vocabulary rule for Triominos terms
- *(commit)* Trim redundant example triggers from skill
- *(create-pr)* Add create-pr skill for generating PR titles and descriptions
- *(create-pr)* Fix base-ref ambiguity and add label to gh pr create

### ⚡ Performance

- *(layout)* Instantiate MainMenu once per app lifetime via AppLayout ([#108](https://github.com/tbusser/vueminos/pull/108))

### 🧪 Testing

- *(useRoundManager)* Add comprehensive path coverage

### ⚙️ Miscellaneous Tasks

- Add dependabot config
- Add cooldown to dependabot config
- *(pnpm)* Update to latest v10 and set minimumReleaseAge to 3 days ([#59](https://github.com/tbusser/vueminos/pull/59))
- *(rounds)* Remove dead RoundIdNotFoundError and fix JSDoc ([#103](https://github.com/tbusser/vueminos/pull/103))
- *(turns)* Remove unused updateTurn action ([#104](https://github.com/tbusser/vueminos/pull/104))
- Remove unused CSS rules and dead template props across multiple components ([#105](https://github.com/tbusser/vueminos/pull/105))
- *(cliff)* Skip build(deps) commits from changelog
- *(vscode)* Add extension recommendations and clean up settings

## [1.2.0](https://github.com/tbusser/vueminos/compare/v1.1.0..v1.2.0) - 2026-05-26

### 🚀 Features

- *(pwa)* Add web app manifest, icons, and service worker ([#58](https://github.com/tbusser/vueminos/pull/58))

### 🐛 Bug Fixes

- *(scoring)* Detect game end when finishing winning round ([#57](https://github.com/tbusser/vueminos/pull/57))

### 💼 Other

- Bump dev dependencies to latest versions

## [1.1.0](https://github.com/tbusser/vueminos/compare/v1.0.13..v1.1.0) - 2026-05-22

### 🚀 Features

- *(history)* Allow editing of recent turns during a round ([#55](https://github.com/tbusser/vueminos/pull/55))

### 💼 Other

- *(deps)* Bump dependencies to latest patch/minor versions

### 🚜 Refactor

- *(test-factories)* Replace flat factories with domain-scoped modules ([#53](https://github.com/tbusser/vueminos/pull/53))
- Enforce no-shadow rule and rename shadowing parameters ([#54](https://github.com/tbusser/vueminos/pull/54))

### 📚 Documentation

- *(cursor)* Add code style rule file

### ⚙️ Miscellaneous Tasks

- Add intlify to cSpell wordlist

## [1.0.13](https://github.com/tbusser/vueminos/compare/v1.0.12..v1.0.13) - 2026-05-12

### 🐛 Bug Fixes

- *(i18n)* Replace all hardcoded English strings with translation keys ([#46](https://github.com/tbusser/vueminos/pull/46))
- *(useGameLogic)* Use Number.isFinite and add missing i18n key

### 💼 Other

- *(deps)* Bump runtime and dev dependencies to latest versions
- *(eslint)* Fix flat config scoping, and split lint scripts ([#50](https://github.com/tbusser/vueminos/pull/50))
- *(eslint)* Add vue-i18n linting with jsonc-eslint-parser ([#51](https://github.com/tbusser/vueminos/pull/51))

### 🚜 Refactor

- Rename BaseView story file to BaseScreen
- *(screens)* Replace unnecessary v-html with text interpolation ([#47](https://github.com/tbusser/vueminos/pull/47))
- *(rounds)* Replace spread-based mutations with in-place updates ([#49](https://github.com/tbusser/vueminos/pull/49))
- *(test-factories)* Extract shared test factories from test files
- *(composables)* Extract requireCurrentRound guard helper ([#52](https://github.com/tbusser/vueminos/pull/52))

### ⚡ Performance

- *(useGameScores)* Avoid recomputing finished-round scores on every trigger ([#48](https://github.com/tbusser/vueminos/pull/48))

### 🎨 Styling

- *(useRules.test)* Add missing blank line after imports

### 🧪 Testing

- *(usePlayerManager)* Add unit tests for usePlayerManager composable

### ⚙️ Miscellaneous Tasks

- *(publish)* Guard release script against non-master branches
- *(husky)* Align hooks with master branch convention

## [1.0.12](https://github.com/tbusser/vueminos/compare/v1.0.11..v1.0.12) - 2026-05-08

### 🐛 Bug Fixes

- *(button)* Restore iOS touch active state via tap-highlight-color ([#44](https://github.com/tbusser/vueminos/pull/44))
- *(round-view)* Show aggregated score in turn header ([#45](https://github.com/tbusser/vueminos/pull/45))

### 🚜 Refactor

- *(scoring)* Move score aggregation out of the rounds store ([#38](https://github.com/tbusser/vueminos/pull/38))
- *(turns)* Remove roundId from Turn and simplify store ([#39](https://github.com/tbusser/vueminos/pull/39))
- *(leftover-points)* Replace inline Record<Id, number> with LeftoverPoints type ([#40](https://github.com/tbusser/vueminos/pull/40))
- *(collect-points)* Extract round-end point collection into composable ([#41](https://github.com/tbusser/vueminos/pull/41))

### 🎨 Styling

- *(types)* Remove blank line in LeftoverPoints declaration

### 🧪 Testing

- *(rounds)* Add multi-player coverage to playerScores

### ⚙️ Miscellaneous Tasks

- *(cliff)* Add compare links to version headings in changelog
- *(changelog)* Regenerate with compare links and no unreleased section
- *(pr-checks)* Add type check step to PR workflow

## [1.0.11](https://github.com/tbusser/vueminos/compare/v1.0.10..v1.0.11) - 2026-05-05

### 🐛 Bug Fixes

- *(rounds)* Validate currentPlayerId and document thrown errors
- *(button)* Prevent text selection to restore :active on iOS

### 💼 Other

- Bump dev dependencies
- *(eslint)* Fix vitest plugin glob to match .test.ts file convention

### 🚜 Refactor

- *(useRules)* Move triple-stone eligibility rule into useRules
- *(useGameLogic)* Rename clearGameData to resetGameProgress ([#33](https://github.com/tbusser/vueminos/pull/33))
- *(useRoundManager)* Move round-end mutations out of helper predicates
- *(rounds)* Remove redundant updateCurrentRoundField action ([#34](https://github.com/tbusser/vueminos/pull/34))
- *(ScoreLeaderboard)* Rename Leaderboard to satisfy multi-word rule
- *(useRules)* Remove Pinia dependency by replacing reactive computed with pure function ([#36](https://github.com/tbusser/vueminos/pull/36))
- *(ScoreLeaderboard)* Decouple from useRoundManager and useRoundsStore ([#37](https://github.com/tbusser/vueminos/pull/37))

### 📚 Documentation

- *(id)* Move JSDoc comment to above the function signature
- *(code-review)* Add architectural awareness to review skill

### 🧪 Testing

- *(vitest)* Migrate to jsdom environment and add first unit tests ([#32](https://github.com/tbusser/vueminos/pull/32))
- Add unit tests for the Pinia stores ([#35](https://github.com/tbusser/vueminos/pull/35))

### ⚙️ Miscellaneous Tasks

- Add lint and unit test checks to PR workflow
- *(pr-checks)* Read Node version from pnpm-workspace.yaml
- *(pr-checks)* Fix indentation of node-version step

## [1.0.10](https://github.com/tbusser/vueminos/compare/v1.0.9..v1.0.10) - 2026-05-01

### 🐛 Bug Fixes

- *(publish)* Create annotated tag so --follow-tags pushes it

## [1.0.9](https://github.com/tbusser/vueminos/compare/v1.0.8..v1.0.9) - 2026-05-01

### 🐛 Bug Fixes

- *(release)* Use --current flag and skip all release commits

## [1.0.8](https://github.com/tbusser/vueminos/compare/v1.0.7..v1.0.8) - 2026-05-01

### ⚙️ Miscellaneous Tasks

- *(cliff)* Link PR numbers in changelog to GitHub

## [1.0.7](https://github.com/tbusser/vueminos/compare/v1.0.6..v1.0.7) - 2026-05-01

### 🐛 Bug Fixes

- *(TurnScreen)* Reject array values from ToggleButtonGroup bonus handler ([#14](https://github.com/tbusser/vueminos/pull/14))

### 💼 Other

- *(vite)* Remove redundant @components and @composables path aliases

### 🚜 Refactor

- Release script and tagging
- *(views)* Replace static router import with useRouter() composable ([#12](https://github.com/tbusser/vueminos/pull/12))
- *(rounds)* Move round ordinal computation into the rounds store ([#13](https://github.com/tbusser/vueminos/pull/13))
- *(MainMenu)* Drive bottom sheet open state via local ref ([#15](https://github.com/tbusser/vueminos/pull/15))

### ⚙️ Miscellaneous Tasks

- Update release template
- Replace magic number for opening bonus
- Enforce conventional commit style on PR titles
- *(skills)* Add commit skill for conventional commit message generation
- Add workflow to create github release on tag push

## [1.0.6](https://github.com/tbusser/vueminos/compare/v1.0.5..v1.0.6) - 2026-04-30

### ⚙️ Miscellaneous Tasks

- Update changelog template
- Use git-cliff to manage version bump

## [1.0.5](https://github.com/tbusser/vueminos/compare/v1.0.4..v1.0.5) - 2026-04-29

### 🐛 Bug Fixes

- Add requireFinishedGame to RouteMeta
- Adjust import path

### ⚙️ Miscellaneous Tasks

- Add commit message linting
- Add auto changelog generation

## [0.1.0] - 2026-04-28

