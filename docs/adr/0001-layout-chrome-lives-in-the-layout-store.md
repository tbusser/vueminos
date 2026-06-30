# ADR-0001: Layout chrome lives in the layout store

- Status: Accepted
- Date: 2026-06-30
- Deciders: tbusser
- Supersedes: —
- Related: [#117](https://github.com/tbusser/vueminos/issues/117), [#132](https://github.com/tbusser/vueminos/issues/132)

## Context

The persistent app chrome — screen `title`, `subtitle`, and the bottom-sheet
open flag — is rendered by `AppLayout` (via `HeaderBar`), an ancestor of the
router view. The value of the title and subtitle is determined by the active
screen, which is a descendant of `AppLayout`. So per-screen chrome has to be
carried *up* from the active screen to the persistent header.

This state was previously held in two module-level singleton composables
(`useScreenTitle`, `useBottomSheet`). Their singleton invariant — that every
caller shares the same `ref`s — was hidden from the interface and leaked
across test runs, with no clean way to reset between them. Issue #117 ran the
deletion test, confirmed the modules earned their keep, and consolidated them
into a single Pinia `useLayoutStore` exposing `title`, `subtitle`,
`isBottomSheetOpen` plus a `$reset()`.

A later architecture review (candidate "Stop relaying screen titles through
the layout store", issue #132) proposed the opposite: drop `title`/`subtitle`
from the store and have `AppLayout` source them from route meta or
`provide`/`inject`, on the grounds that a descendant writing state an ancestor
reads is a side-channel.

This ADR records why the layout store keeps the title/subtitle, so the
side-channel idea is not re-suggested.

## Decision

`title`, `subtitle`, and `isBottomSheetOpen` stay in `useLayoutStore`.
`BaseScreen` sets the title/subtitle; `AppLayout`/`HeaderBar` read them. The
store remains the single, explicit home for shared layout chrome.

## Rationale

- **Titles are dynamic, not static-per-route.** `RoundView` computes the
  subtitle from live scores and tile counts and the title from the current
  player. Route meta can only express static-per-route values, so it cannot
  carry this state.
- **`provide`/`inject` is a lateral move, not a deepening.** A reactive title
  ref provided by `AppLayout` and set by descendant screens has the same shape
  as the store — a descendant still writes what the ancestor reads. It would
  scope the state to the component tree but reopen the exact test-isolation
  problem #117 closed, with no gain in depth or locality.
- **The store makes the singleton invariant explicit.** Shared state is named
  shared state, and `$reset()` clears all layout chrome between tests without
  module-reload tricks. This is consistent with `useSettingsStore`.
- **The deletion test was already applied in #117.** Removing the modules
  reintroduces tight direct coupling in `AppLayout`, `BaseScreen`, and
  `BottomSheet`; the store concentrates that complexity.

## Consequences

- Per-screen chrome continues to flow: screen -> `BaseScreen` -> layout store
  -> `AppLayout`/`HeaderBar`.
- Tests reset layout chrome via the store's `$reset()`.
- Architecture reviews should treat the "title side-channel" framing as
  settled and not re-propose removing title/subtitle from the layout store
  unless a materially different design (one that handles dynamic titles and
  improves test isolation over the store) emerges.
- The only acknowledged residual smell — `BaseScreen` setting the title via two
  `immediate` watchers — is a cosmetic tidy-up, not an architectural change.

## Alternatives considered

- **Route meta for title/subtitle.** Rejected: cannot express dynamic,
  per-render titles (live scores, current player).
- **`provide`/`inject` reactive refs.** Rejected: same descendant-writes /
  ancestor-reads shape as the store, but reopens test-isolation concerns
  without a depth or locality gain.
- **Teleport the header into each screen.** Rejected: loses the single
  persistent header owned by `AppLayout`.
