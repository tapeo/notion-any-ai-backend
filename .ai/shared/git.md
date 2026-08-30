# Git workflow

GitHub Flow: a single long-lived `main` branch, short-lived feature branches, PR-based merges. Releases are tagged on `main` with semantic versioning.

---

## Branch strategy

- **`main`** is the only long-lived branch. It is always deployable. No `develop`, no release branches.
- All work happens on short-lived branches off the latest `main`:
  - `feat/<scope>` for new features
  - `fix/<scope>` for bug fixes
  - `chore/<scope>` for tooling, deps, refactors with no behavior change
  - `docs/<scope>` for documentation only
- Branch from the latest `main`: `git checkout main && git pull --rebase && git checkout -b feat/<scope>`.
- If a branch lives long enough to fall behind, rebase onto `main` before merge: `git fetch origin && git rebase origin/main`.
- Squash-merge every PR into `main`. One commit per PR.
- Delete the branch after merge (locally and on the remote).

---

## Commit messages (Conventional Commits)

Format:

```
type(scope): subject

body
```

- `type`: one of `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`, `ci`.
- `scope`: optional, short area name (feature name, `deps`, `ci`, etc.).
- `subject`: imperative mood, sentence case, no trailing period. Lowercase first word unless a proper noun.
- Body: optional, wrapped at 72 cols. Explain **why**, not what. Blank line between subject and body.
- One logical change per commit. Atomic. No mixed concerns.
- No AI attribution lines. No `Co-authored-by`. No `Generated with ...` trailers.

Examples:

```
feat(auth): add token refresh on 401
fix(router): correct deep-link redirect on cold start
chore(deps): bump framework to latest stable
docs(git): add git workflow guide
```

---

## Pull requests

- PRs are required for all merges to `main`. No direct pushes to `main`.
- PR title mirrors the squash-commit subject, Conventional Commits format.
- PR description sections:
  - **Summary**: one paragraph, what and why.
  - **How**: numbered steps or bullet points of the approach.
  - **Verification**: the project's verify command passes (see the kit `AGENTS.md`), tests if any, manual steps if any.
- Run the project's verify command before requesting review. Fix all errors. No lint-disable comments.
- Squash-merge. The squash subject is the PR title.
- Delete the branch on merge (enable "Automatically delete head branches" in repo settings).
- Include the matching `changes/` entry (per `process.md`) in the same PR as the feature. The `changes/README.md` doubles as the PR changelog.

---

## Releases (Semantic Versioning)

- Tag `main` with `vMAJOR.MINOR.PATCH` after a release PR or once `main` is in a deployable state.
- Bump rules:
  - `MAJOR`: breaking changes, incompatible API or data migrations.
  - `MINOR`: new features (`feat`), backward compatible.
  - `PATCH`: bug fixes (`fix`), perf improvements (`perf`), backward compatible.
- Annotated, signed tags:

  ```bash
  git tag -a v1.2.3 -m "Release 1.2.3"
  git push origin v1.2.3
  ```

- No separate release branch. The deployable state is whatever commit on `main` the tag points to.
- Record the release in a `changes/` folder entry per `process.md`, and note the tag in the release PR description.

---

## First-time setup

When scaffolding a new project:

```bash
git init
git add .
git commit -m "chore: initial scaffold"
git branch -M main
git remote add origin <remote-url>
git push -u origin main
```

Recommended local config:

```bash
git config pull.rebase true
git config commit.gpgsign true   # optional, if you have a GPG/SSH signing key
```

Branch protection on `main` (configure in the repo host UI):

- Require pull request reviews before merge (at least one approval for team repos, none required for solo).
- Require status checks to pass: the project's verify command (CI config per kit).
- Do not allow direct pushes to `main`.
- Enable "Automatically delete head branches" after merge.

First release:

```bash
git tag -a v0.1.0 -m "Release 0.1.0"
git push origin v0.1.0
```

---

## What to avoid

| anti-pattern                                | reason                                                       | do instead                                                       |
| ------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| Direct pushes to `main`                     | Bypasses review, breaks deployability guarantee              | Open a PR, squash-merge after review                             |
| Merge commits without squash                | Clutters history, mixes WIP commits into `main`              | Squash-merge, one commit per PR                                  |
| Long-lived feature branches                 | Diverges from `main`, painful rebase, stale review context   | Keep branches short, rebase onto latest `main` before merge      |
| Branching off stale `main`                  | Builds on outdated base, causes avoidable conflicts          | `git pull --rebase` on `main` before branching                   |
| AI attribution lines / `Co-authored-by`     | Noise in history, inconsistent attribution                   | Omit them. The commit author is enough                           |
| `--no-verify` / skipping hooks              | Bypasses lint, verify, secret checks                         | Fix the underlying issue, let hooks run                          |
| Skipping the verify command before merge    | Lets lint errors land on `main`                              | Run the verify command locally, fix all errors, then open the PR |
| Editing previous `changes/` folders         | Rewrites history, breaks immutability of the change log      | Create a new `changes/` folder for the new change                |

---

## Critical rules

| rule                                                                  | reference            |
| --------------------------------------------------------------------- | -------------------- |
| One long-lived `main` branch, always deployable                       | this file            |
| No direct pushes to `main`, PRs required                              | this file            |
| Squash-merge, one commit per PR                                       | this file            |
| Conventional Commits format for all commit/PR subjects                | this file            |
| No AI attribution lines, no `Co-authored-by`                          | this file            |
| Tag releases with `vMAJOR.MINOR.PATCH` on `main`                      | this file            |
| Run the project's verify command before opening a PR                  | this file            |
| Branch names: `feat/`, `fix/`, `chore/`, `docs/` prefixed             | this file            |
| Commit the `changes/` entry in the same PR as the feature             | `process.md`         |
| Never edit previous `changes/` folders                                | `process.md`         |