# Agent Kit Shared

Platform-agnostic agent instructions shared between the agent kits
([flutter-agent-kit](https://github.com/tapeo/flutter-agent-kit),
[nextjs-agent-toolkit](https://github.com/tapeo/nextjs-agent-toolkit)).

Each kit vendors this repo into `agents/.ai/shared/` via git subtree. Scaffolded
projects receive the same files, so references from the kit `AGENTS.md` stay
valid inside generated apps.

## What belongs here

Only content that is identical (or near-identical) in both kits and has no
platform coupling:

| file            | contents                                                             |
| --------------- | -------------------------------------------------------------------- |
| `AGENTS.md`     | Entry file, reading order for the docs below                         |
| `git.md`        | GitHub Flow, Conventional Commits, semantic versioning               |
| `process.md`    | `changes/` folder convention and README template                     |
| `principles.md` | Operating principles shared by all kit agents                        |
| `code-style.md` | Language-agnostic code style: naming, comments, text discipline      |
| `dispatch.md`   | On-demand routing to language/framework kit docs (global role)       |
| `CLAUDE.md`     | Tool pointer, scaffolded to project root, redirects to `AGENTS.md`   |
| `CURSOR.md`     | Tool pointer, scaffolded to project root, redirects to `AGENTS.md`   |
| `GEMINI.md`     | Tool pointer, scaffolded to project root, redirects to `AGENTS.md`   |

`AGENTS.md` also serves as the global entry point on the maintainer's machine:
harnesses (opencode, claude, codex, pi, openclaude) point at it directly via
their config or small pointer files, so there is one source for global and
kit instructions.

Do not add: framework rules (Flutter/Riverpod, Next.js/React), tool commands
(`fvm flutter analyze`, `npm run lint`), file-naming tables that reference
platform file types. Those live in each kit's `.ai/` docs. Exceptions:
the `TypeScript minima` section in `code-style.md`, which also covers global
TypeScript work outside the kits, and `dispatch.md`, which carries
machine-absolute kit paths because it only serves the global maintainer
machine. When vendored into kits, `dispatch.md` stays active: it loads kit
docs whenever both its marker and framework-task gates match, and it skips
the vendored `.ai/shared/` copies since they duplicate this repo's files.

## Sync

Edit and commit here first, then pull into each kit:

```bash
git subtree pull --prefix agents/.ai/shared git@github.com:tapeo/core-agents-kit.git main --squash
```

Repeat in both kit repos in the same session so the kits do not drift. Update
the kit `AGENTS.md` file index if a file was added or removed.