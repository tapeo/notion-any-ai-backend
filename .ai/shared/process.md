# Change tracking and process

Maintain a `changes/` folder at the project root as the source of truth for project state.

## Convention

```
changes/
  YYYY-MM-DD_HH-MM_kebab-slug/
    README.md
```

- Date/time in 24h local time. `slug` is a short kebab-case description.
- One folder per change. Do not edit previous folders.
- Entry files stay short. A few lines, not a report.

## `README.md` template

Short, but every entry must carry what the next iteration needs to know.

```markdown
## Change

One sentence: what changed and why.

## Decisions

- rule or decision now in effect (terse bullets, no prose)
- gotchas the next iteration must know: paths, orderings, exceptions, what NOT to redo

## Files

- `path/to/file.ext` (created|modified|deleted)
```

- `## Change` states the reason. `## Decisions` carries continuity: if a future agent would otherwise break or redo something, it belongs here.
- Optional one-liner `## Verification` when how it was checked is not obvious.

## Workflow

1. Before work, read the newest `changes/` README for current project state.
2. After completing a change, create the folder and write the short README. Put attachments in it.
3. End the change by presenting the commit message in `type(scope): subject` form (see `git.md`). Never commit unless the user asks.
4. Commit the `changes/` entry in the same PR as the feature.
