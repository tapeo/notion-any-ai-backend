# Tool pointer files

## Summary

Moved `CLAUDE.md`, `CURSOR.md`, `GEMINI.md` into this repo. They were
byte-identical in both kits (`agents/`), so they qualify under the same rule
as the other shared files: identical content, no platform coupling.

## How it works

1. Files live at the repo root with their original uppercase names, so kits
   that vendor this repo at `agents/.ai/shared/` receive them at
   `agents/.ai/shared/CLAUDE.md` etc. and scaffolds can copy them 1:1 to the
   scaffolded project root.
2. Each kit's `scaffold.sh` copies them from `agents/.ai/shared/` to the
   project root instead of from `agents/`.
3. The kit-level copies at `agents/CLAUDE.md`, `agents/CURSOR.md`,
   `agents/GEMINI.md` are deleted after the subtree pull.

## Edge cases handled

- Copied with `cp` from the kit to preserve exact bytes (no trailing newline),
  keeping future subtree merges conflict-free.
- README "What belongs here" table documents the new files and their
  scaffold-to-root role, so the boundary rule stays clear.

## Files

### Created

- `CLAUDE.md`
- `CURSOR.md`
- `GEMINI.md`
- `.gitignore` (`.DS_Store`)

### Modified

- `README.md`

## Verification

- `md5` of the three new files matches the kit originals exactly.
