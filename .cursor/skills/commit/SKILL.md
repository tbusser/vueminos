# commit

## Purpose

Generates a commit message from staged git changes and commits them upon
confirmation. The message follows the Conventional Commits specification and
focuses on explaining **why** the changes were made, not just what changed.

## When to Use This Skill

Use this skill when:
- Staged changes are ready and a commit message needs to be written
- User says "write a commit message", "generate a commit", "what should my
  commit say", "commit message for staged changes", or "commit this"
- User wants the commit to follow conventional commit conventions

## Workflow

### Step 1 — Read the diff

Run the following commands to gather context:

```bash
# All staged changes (files + line-level diff)
git diff --staged

# List of changed files for a quick overview
git diff --staged --name-status
```

If nothing is staged, stop and tell the user to stage their changes first
(`git add`).

### Step 2 — Determine the conventional commit type

Map the diff to one of the following types. When multiple types apply, pick
the **highest-priority** one (listed top to bottom).

| Priority | Type       | When to use |
|----------|------------|-------------|
| 1        | `feat`     | New user-facing functionality is added |
| 2        | `fix`      | A bug causing incorrect behaviour is corrected |
| 3        | `perf`     | Code is changed solely to improve performance |
| 4        | `refactor` | Code is restructured without adding features or fixing bugs |
| 5        | `test`     | Tests are added or corrected |
| 6        | `build`    | Build system or dependencies change |
| 7        | `ci`       | CI pipeline files change |
| 8        | `docs`     | Documentation or comments only |
| 9        | `style`    | Formatting, whitespace — zero logic change |
| 10       | `chore`    | Maintenance that fits none of the above |
| 11       | `revert`   | A previous commit is undone |

Append `!` to the type when the change is breaking (e.g. `feat!`).

### Step 3 — Derive the scope (optional)

If the changes are confined to a clear area of the codebase, add a scope in
parentheses. Use the directory name, feature name, or component name. Keep it
short and lowercase.

Examples: `feat(scoring)`, `fix(router)`, `refactor(useRules)`

### Step 4 — Write the commit subject line

Follow the Conventional Commits format exactly:

```
<type>(<scope>): <short imperative description>
```

Rules:
- Maximum 72 characters
- Lowercase after the colon
- Imperative mood ("add", "fix", "remove" — not "added" or "fixes")
- No trailing period

### Step 5 — Write the commit body (when needed)

Add a body when the subject line alone does not convey the motivation. Separate
it from the subject with a blank line.

```
<Explain why this change was necessary. What problem does it solve?
What constraint, user need, or code-quality concern prompted it?>

<Optionally: a short bullet list of the concrete changes if there are
several distinct parts worth calling out individually.>
```

**Writing rules for the body:**
- Lead with the **why**, not the what
- Skip the body if the subject line is self-explanatory
- Avoid filler phrases ("This commit…", "In this change…")
- Wrap lines at **80 characters maximum** — break before the limit, never after
- Every line must contain **at least two words** — no single-word lines

### Step 6 — Output

Present the subject line and body in **two separate code blocks** so the user
can copy each part independently.

**Subject line:**

```
refactor(useRules): replace magic number with named scoreModifiers constant
```

**Message body:**

```
10 had no named entry in scoreModifiers, making it hard to find and update
if the triple-connection rule ever changed. Adding tripleBonus: 10 keeps
all game-rule values in one place alongside bridge and doubleSided.
```

If the subject line is self-explanatory and no body is needed, output the
subject block and write "No body needed." beneath it instead of a second block.

After both blocks, briefly note the detected type and scope so the user can
confirm or correct them before copying.

### Step 7 — Ask for confirmation before committing

After presenting the message, ask the user:

> Commit staged changes with this message? (yes / no / edit)

Handle each response:

- **yes** — run the commit command. Include the body only when one was
  generated:
  ```bash
  # Subject only
  git commit -m "<subject>"

  # Subject + body
  git commit -m "<subject>" -m "<body>"
  ```
  Confirm success by showing the output of `git log --oneline -1`.

- **no** — do nothing. Tell the user the staged changes are untouched.

- **edit** — ask the user what they want to change (type, scope, subject, or
  body), update the relevant block, then repeat the confirmation prompt.

Never run `git commit` without an explicit "yes" from the user.

## Example triggers

- "Write a commit message for my staged changes"
- "Generate a commit message"
- "What should my commit say?"
- "Commit message following conventional commits"
- "Commit this"
