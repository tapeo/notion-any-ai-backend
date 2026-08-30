## Summary

Added the missing `AGENTS.md` entry file (the tool pointers already
referenced one) and folded the maintainer's global dotfiles instructions into
this repo. The maintainer's harnesses (opencode, claude, codex, pi,
openclaude) now point at this repo directly instead of keeping a separate
copy of global instructions in dotfiles.

## How it works

1. `AGENTS.md` lists the four docs in reading order with relative paths, so
   it works both vendored into kits and as a global entry point.
2. `principles.md` gained `Responses`, `Execution`, and `Documentation`
   sections, plus commit/PR discipline under `Safety`. These came from the
   dotfiles global AGENTS.md and `triggers/code.md`.
3. `code-style.md` gained `Simplicity`, `Comments`, `Clarity`, `Build and
   environment`, and a `TypeScript minima` section. TypeScript content is
   the one documented exception to the no-platform-coupling rule because it
   also covers global non-kit TS work.
4. `process.md` gained the commit-message presentation step in the workflow.
5. `README.md` documents the `AGENTS.md` row, its dual role (kit-vendored
   and global entry point), and the TypeScript exception.

## Edge cases handled

- Stack-specific dotfiles instructions (React/TanStack, Next.js,
  Flutter/Riverpod, MongoDB/Luxon) were not moved: the kits' `agents/.ai/`
  docs already cover them.
- If the repo moves from `~/projects/agent-kit/core-agents-kit`, the
  absolute pointers in dotfiles must be updated.

## Files

### Created

- `AGENTS.md`

### Modified

- `principles.md`
- `code-style.md`
- `process.md`
- `README.md`

## Verification

- No em dashes in new or modified content.
- `README.md` table rows stay aligned.
