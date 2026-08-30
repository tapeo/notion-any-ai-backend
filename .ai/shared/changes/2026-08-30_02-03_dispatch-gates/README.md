## Summary

Reworked `dispatch.md` so kit docs load only when actually needed, after the
previous "always fire, load everything" change overshot. Two gates now guard
every kit read, and vendored `.ai/shared` docs are skipped as duplicates of
this repo.

## How it works

1. Marker gate: a cheap glob for `pubspec.yaml` or `next.config.*` /
   a `"next"` or `"react"` dependency at the project root. Always allowed,
   even just to decide whether to load anything.
2. Task gate: the current task must touch framework code (widgets, routes,
   controllers, hooks, models, services, navigation, state). Questions,
   repo overviews, docs, git/PR work, and unrelated infra read nothing from
   the kit.
3. Project-local `AGENTS.md` and `.ai/` never block dispatch: when both
   gates pass, local docs load, the kit entry loads, then only
   task-relevant kit docs from its routing table.
4. Dedupe: `.ai/shared/*` inside a kit is a vendored copy of this repo,
   already loaded globally, so it is skipped when a routing table points
   there.
5. Contradiction order (only when sources disagree): project-local, then
   kit repo, then core. The order never removes a source.

## Edge cases handled

- Plain React stays routed to the nextjs toolkit as nearest fit, with
  App Router-only sections skipped.
- Scaffolded projects with vendored `.ai/` still get fresh kit-repo docs
  for the task topic, since the maintainer asked to load all sources.

## Files

### Modified

- `dispatch.md`
- `README.md`

## Verification

- No em dashes in new content.
- Live probes: non-framework prompt in a Next.js project reads no kit docs;
  framework prompt reads the kit entry and task doc only.
