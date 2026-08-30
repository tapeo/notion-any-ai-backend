## Summary

Added `dispatch.md`, a small always-loaded routing table that points a
session at the right language/framework kit (`flutter-agent-kit` or
`nextjs-agent-toolkit`) based on marker files in the project, so kit docs no
longer need to be copied into every project.

## How it works

1. A project with its own `AGENTS.md` or `.ai/` at the root takes
   precedence, dispatch never fires there, so scaffolded projects are
   untouched.
2. Markers: `pubspec.yaml` routes to the flutter kit, `next.config.*` or a
   `next` dependency routes to the nextjs toolkit, a `react` dependency
   without `next` routes to the toolkit as nearest fit with the Next.js-only
   sections skipped.
3. The kit `AGENTS.md` is the only file read first, its internal routing
   table then pulls only the `.ai` docs the current task needs.
4. `.ai/skills/...` references remap to `agents/skills/...` inside the kit
   repos, because scaffolds copy skills into `.ai/skills/` but the kit repos
   keep them outside `.ai/`.
5. Conflicts between a kit doc and this repo resolve: kit wins on framework
   topics, core wins on everything else.

## Edge cases handled

- `dispatch.md` carries machine-absolute paths and is documented in README
  as serving only the global entry-point role, like the TypeScript minima.
- When vendored into kits via subtree it is inert: scaffolded projects win
  via the precedence rule.
- Core `AGENTS.md` reading list gains the new file; all five harnesses pick
  it up through their existing pointers without edits.

## Files

### Created

- `dispatch.md`

### Modified

- `AGENTS.md`
- `README.md`

## Verification

- No em dashes in new content.
- README table alignment preserved.
