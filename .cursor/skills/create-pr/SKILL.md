# create-pr

## Purpose

Generates a pull request title and description from the commits on the current
branch. The description focuses on **why** the changes were made, surfaces the
most important changes, and gives reviewers everything they need in one place.

## When to Use This Skill

Use this skill when:
- A branch is ready for review and a PR description needs to be written
- User says "write a PR", "write a PR description", "open a PR", "draft a PR
  message", "what should my PR say", or "create a pull request"
- User wants the PR to communicate intent, not just list commits

## Workflow

### Step 1 — Identify the base branch and gather commits

Run the following commands:

```bash
# Find the most likely base branch without a remote round-trip
# Outputs the full ref, e.g. "origin/main" — use this directly as <base-ref>
git rev-parse --abbrev-ref origin/HEAD
# If that prints "origin/HEAD" (ref not set), fall back to:
git branch -r | grep 'HEAD ->'

# All commits on this branch not yet on the base
git log <base-ref>..HEAD --oneline

# Full commit messages for those commits (motivation lives here)
git log <base-ref>..HEAD --format="%H%n%s%n%b%n---"

# Files changed, for scope awareness
git diff <base-ref>...HEAD --name-status
```

If the branch has no commits ahead of the base, stop and tell the user there
is nothing to open a PR for.

### Step 2 — Understand the change as a whole

Before writing anything, answer these questions internally:

- **What problem does this branch solve?** (Read commit bodies, not just
  subjects — the "why" lives there.)
- **What is the single most important commit?** That commit usually anchors the
  PR title.
- **Are there any breaking changes?** Look for `!` in commit types, or changes
  to public function signatures, exported types, or store shapes.
- **Are there issue references?** Scan commit subjects for `(#NNN)` or
  `fixes #NNN` patterns.

### Step 3 — Write the PR title

Follow the same Conventional Commits format used for commit messages:

```
<type>(<scope>): <short imperative description>
```

Rules:
- Maximum 72 characters
- Lowercase after the colon
- Imperative mood ("add", "fix", "remove" — not "added" or "fixes")
- No trailing period
- Scope is the feature area or primary file/composable affected, not a
  directory path

If the branch contains commits of mixed types, pick the **highest-priority**
type from the commit skill's priority table (feat > fix > perf > refactor …).

### Step 4 — Write the PR description

Use the following template. Include every section; omit a section only when it
genuinely has no content (e.g. no breaking changes).

---

**What this PR does**

One to three sentences explaining the problem being solved and the approach
taken. This is the "why", not a list of files touched. A reviewer who knows
nothing about the branch should understand the motivation after reading this.

**Key changes**

Bullet list of the most important individual changes. Aim for three to six
bullets. Each bullet should name what changed and why it matters — not just
restate the commit subject verbatim.

- Prefer "X now does Y so that Z" over "Changed X to do Y"
- Group related commits into a single bullet rather than listing every commit
- Lead with the highest-impact change

**Breaking changes** *(omit if none)*

List anything that changes a public contract: function signatures, exported
types, store shape, emitted events, or route names. For each:
- What changed
- What callers need to update

**Testing notes**

Describe how the changes were verified. Mention specific test files if unit
tests were added or changed. If no automated tests cover the change, say so and
explain why.

**Closes** *(omit if no linked issues)*

```
Closes #NNN
```

---

**Writing rules for the body:**
- Lead every section with substance — skip filler like "This PR…" or "In this
  change…"
- Keep "Key changes" scannable; reviewers read it in 30 seconds
- If a commit body already explains the motivation well, borrow the phrasing
  rather than paraphrasing it worse

### Step 5 — Output

Present the title and description in **two separate code blocks** so the user
can copy each part independently.

**Title:**

```
refactor(useRounds): surface game-over signal from finishCurrentRound
```

**Description:**

```markdown
**What this PR does**

`RoundView` was consulting `useGameScores.hasReachedPointsLimit` directly to
decide whether to navigate to the game-over screen after finishing a round.
That decision is domain logic that belongs inside `useRounds`, not in the view.
This PR moves it there by returning a `gameOver` flag from `finishCurrentRound`.

**Key changes**

- `finishCurrentRound` now returns `Feedback<{ gameOver: boolean }>` — the flag
  is set by checking `hasReachedPointsLimit` inside `useRounds` before returning
- `RoundView` reads `result.gameOver` instead of importing `useGameScores` for
  this purpose; `hasReachedPointsLimit` is no longer destructured in the view
- `Feedback<T>` payload properties are now spread directly onto the return
  object rather than nested under a `payload` key, reducing access verbosity
  across all callers

**Testing notes**

`useRounds.test.ts` covers `gameOver: true` and `gameOver: false` return values
directly, without needing to mount the view. `RoundView.test.ts` verifies the
navigation path is taken when the flag is set.

Closes #118
```

After both blocks, briefly note any assumptions made (e.g. inferred base
branch, inferred issue link) so the user can correct them before proceeding.

### Step 6 — Ask for confirmation before creating the PR

After presenting the message, ask the user:

> Create PR with this title and description? (yes / no / edit)

Handle each response:

- **yes** — before creating the PR, check for unpushed commits:
  ```bash
  git log origin/<current-branch>..HEAD --oneline
  ```
  If any commits are listed, warn the user that those commits are not on the
  remote yet and ask whether to push first. If they confirm, run `git push`
  before proceeding. Then run:
  ```bash
  gh pr create --title "<title>" --label "<type>" --body "$(cat <<'EOF'
  <description>
  EOF
  )"
  ```
  The `--label` value is the conventional commit type from the PR title (e.g.
  `refactor`, `fix`, `feat`). These labels exist in the repo and match the
  type names exactly. Omit `--label` only if the type has no matching label.

  Confirm success by printing the URL returned by `gh pr create`.

- **no** — do nothing. Tell the user the branch is untouched.

- **edit** — ask what they want to change (title, a specific section, or the
  issue link), update only that part, then repeat the confirmation prompt.

Never run `gh pr create` without an explicit "yes" from the user.

## Example triggers

- "Write a PR description for this branch"
- "Draft a PR message"
- "Open a PR"
- "What should my PR say?"
- "Create a pull request"
