## [1.0.11] - 2026-05-05

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

## [1.0.10] - 2026-05-01

### 🐛 Bug Fixes

- *(publish)* Create annotated tag so --follow-tags pushes it

## [1.0.9] - 2026-05-01

### 🐛 Bug Fixes

- *(release)* Use --current flag and skip all release commits

## [1.0.8] - 2026-05-01

### ⚙️ Miscellaneous Tasks

- *(cliff)* Link PR numbers in changelog to GitHub

## [1.0.7] - 2026-05-01

### 🐛 Bug Fixes

- *(TurnScreen)* Reject array values from ToggleButtonGroup bonus handler (#14)

### 💼 Other

- *(vite)* Remove redundant @components and @composables path aliases

### 🚜 Refactor

- Release script and tagging
- *(views)* Replace static router import with useRouter() composable (#12)
- *(rounds)* Move round ordinal computation into the rounds store (#13)
- *(MainMenu)* Drive bottom sheet open state via local ref (#15)

### ⚙️ Miscellaneous Tasks

- Update release template
- Replace magic number for opening bonus
- Enforce conventional commit style on PR titles
- *(skills)* Add commit skill for conventional commit message generation
- Add workflow to create github release on tag push

## [1.0.6] - 2026-04-30

### ⚙️ Miscellaneous Tasks

- Update changelog template
- Use git-cliff to manage version bump
## [1.0.5] - 2026-04-29

### 🐛 Bug Fixes

- Add requireFinishedGame to RouteMeta
- Adjust import path

### ⚙️ Miscellaneous Tasks

- Add commit message linting
- Add auto changelog generation
## [0.1.0] - 2026-04-28
