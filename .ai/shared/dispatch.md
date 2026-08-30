# Kit dispatch

Route a session to the right language/framework kit on demand, so kit docs do
not need to be copied into every project. Dispatch only loads kit docs when
the task actually needs framework guidance.

## Gates

Kit docs are read only when BOTH conditions hold:

1. **Marker gate.** A marker file at the project root matches a kit (cheap
   globs, always allowed, even before deciding to load anything).
2. **Task gate.** The current task touches framework code: writing,
   refactoring, or debugging widgets, routes, controllers, hooks, models,
   services, navigation, or state management. Non-framework tasks (general
   questions, repo overview, docs, git/PR work, infra unrelated to the
   framework) read nothing from the kit.

Project-local `AGENTS.md` or `.ai/` never block dispatch and are never
skipped. Everything relevant loads; nothing exits early.

## Detection

| marker                                                     | dispatch to                                                           |
| ---------------------------------------------------------- | --------------------------------------------------------------------- |
| `pubspec.yaml`                                             | `/Users/matteo/projects/agents/flutter-agent-kit/agents/AGENTS.md`    |
| `next.config.js|mjs|ts` or `"next"` in `package.json` deps | `/Users/matteo/projects/agents/nextjs-agent-kit/agents/AGENTS.md` |
| `"react"` in `package.json` deps, without `"next"`         | nextjs toolkit as nearest fit, skip Next.js-only sections             |

For the plain-React case, skip anything App Router specific: route handlers,
`proxy.ts` middleware, server/client component splits. The TanStack Query,
conventions, and data-layer docs still apply.

## How to read a kit

1. Read the kit `AGENTS.md` from the dispatched absolute path first. Read
   only local files under `/Users/matteo/projects/agents/`. Never fetch kit
   docs from the web or guess a remote URL.
2. Follow only the docs its internal routing table points at for the current
   task. Do not load the whole kit.
3. Skills: read a `SKILL.md` only when the feature type matches the task.
4. Kit docs reference scaffold-relative paths. When reading from the kit
   repo, remap them:
   - `.ai/<file>.md` becomes `<kit>/agents/.ai/<file>.md`
   - `.ai/skills/...` becomes `<kit>/agents/skills/...`
5. When the kit routing table points at `.ai/shared/<file>.md`, skip it.
   That file is a vendored copy of this core repo, already loaded globally.
6. If the project has its own `.ai/` docs, read the task-relevant ones too,
   even if the kit repo has a newer copy.

## Contradicting sources

When loaded sources disagree on the same topic, apply them in this order:

1. Project-local `AGENTS.md` and `.ai/` docs
2. Dispatched kit repo docs
3. This repo (core)

The order only resolves conflicts. It never removes a source from context.
