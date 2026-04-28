---
name: code-review
description: Review code changes for bugs, regressions, missing tests, maintainability, and VueMinos project conventions. Use when the user asks for a code review, review of changes, bug finding, or pre-merge assessment.
---

# Code Review

## Review Stance

Prioritize defects over style. Lead with findings, ordered by severity. A finding must describe a concrete risk, not a preference.

Look especially for:
- Incorrect scoring, round, turn, or player state behavior.
- Regressions in persisted game data or route flows.
- Missing edge cases around Triominos score keeping.
- Unsafe assumptions in Vue reactivity, Pinia stores, and composables.
- Missing or weak tests for changed behavior.
- Comments that don't add any information and just restate what the code does.
- Missing comments for code which would benefit from an explanation what or why
  something is happening.
- Warn for `console.log` statements in the code.
- Solution needs to be idiomatic.
- Code should live in the right place. Ensure logic is in the right place or
  perhaps belongs in a composable or store.

## Workflow

1. Inspect the full changed surface, including staged, unstaged, and untracked files.
2. Read surrounding code before judging a change.
3. Compare behavior against the app purpose: Vueminos is a Triominos score keeping app, not a game-playing app.
4. Check project rules relevant to changed files:
   - Vue components use Vue 3.5, TypeScript, `<script setup>`, and Composition API patterns.
   - Pinia stores use setup stores, handle persistence/basic CRUD, and throw `AppError` subclasses for invalid operations.
   - Composables hold business logic, validation, and multi-store orchestration; user-facing operations return `Feedback`.
   - Source imports use `@/`, grouped as Vue imports, third-party imports, then local imports.
5. Validate when useful with project tooling:
   - `pnpm type-check` for TypeScript.
   - `pnpm test:unit` for unit tests.
   - `pnpm lint` only when lint fixes are intended, because it can modify files.

## Finding Criteria

Report a finding only when you can answer:
- What can go wrong?
- Where is the risky code?
- Which user, data, or developer workflow is affected?
- What practical fix or verification would reduce the risk?
- Is it not idiomatic?
- Should logic live somewhere else?

Do not report:
- Pure preference without behavioral or maintenance impact.
- Existing unrelated issues outside the reviewed change.
- Broad rewrites unless the current change makes them necessary.

## Severity

Use these labels:
- `Critical`: Data loss, broken core score keeping, security exposure, or app unusable.
- `High`: Likely user-facing regression, incorrect scores, broken persistence, or blocked main flow.
- `Medium`: Edge-case bug, brittle logic, missing validation, or missing meaningful test.
- `Low`: Maintainability issue with clear future cost.

## Output Format

Use this structure:

```markdown
## Findings
- `Severity` `path`: Concise title.
  Explain the concrete risk, why it matters, and the smallest useful fix.

## Open Questions
- Only include questions that block confidence in the review.

## Notes
Briefly mention what was reviewed, what was not run, and any residual test gap.
```

If there are no findings, say that clearly and still mention test coverage or validation not performed.
