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

