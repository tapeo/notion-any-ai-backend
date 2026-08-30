# Initial shared agent instructions

## Summary

Created this repo as the single source for platform-agnostic agent instructions shared by `flutter-agent-kit` and `nextjs-agent-toolkit`, both of which vendor it at `agents/.ai/shared/` via git subtree.

## How it works

1. `git.md`: GitHub Flow, Conventional Commits, semver. Verify commands described generically as "the project's verify command".
2. `process.md`: `changes/` folder convention and README template, superset of both kit versions (includes the same-PR commit step).
3. `principles.md`: operating principles previously duplicated verbatim in both kit `AGENTS.md` files, plus text discipline with examples.
4. `code-style.md`: language-agnostic rules (no inline ternaries, no lint suppression, barrel-file 5+ rule, import grouping, file size cap, naming).
5. Kits sync with `git subtree pull --prefix agents/.ai/shared git@github.com:tapeo/agent-kit-shared.git main --squash`.

## Edge cases handled

- README defines the boundary: framework rules and tool commands stay in kit `.ai/` docs, only platform-neutral content belongs here.

## Files

### Created

- `README.md`
- `git.md`
- `process.md`
- `principles.md`
- `code-style.md`

## Verification

- Content derived by diffing both kits' `.ai/git.md`, `.ai/process.md`, and duplicated sections; merged and de-frameworkized.