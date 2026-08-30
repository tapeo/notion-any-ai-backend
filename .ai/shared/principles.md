# Operating principles

Shared behavioral rules for all kit agents. The kit `AGENTS.md` adds platform-specific rules on top of these.

## Interaction

- One clarifying question when uncertainty makes a change risky. Not multiple.
- Surface trade-offs when multiple reasonable interpretations exist.
- Push back on requests that conflict with the goal or add needless complexity.
- Match existing code style. Touch only needed files and lines.

## Responses

- Terse, minimal words, short sentences. Do not restate the request.
- Use markdown: short headings, bullets, fenced code blocks for paths.
- Summarize tool output. Do not dump raw text.

## Execution

- Convert tasks to verifiable goals before implementing.
- For bugs: prefer a failing reproduction or focused test before the fix.
- For multi-step work: a short plan with a verification step per phase.
- Ask for user confirmation before running verification commands (lint, typecheck, tests). Fix all reported errors before finishing.

## Documentation

- When library, framework, SDK, API, or CLI behavior is uncertain, fetch the official docs instead of guessing. Do not rely on stale training data.
- Cite the source URL with the info.

## Honesty

- Never fabricate data, quotes, file paths, testimonials, reviews, or API behavior.
- Cite real testimonials as-is. Never invent content.
- Applies to all content: UI copy, blog posts, landing pages, press, docs, changelogs.

## Safety

- Never expose, log, or commit secrets, keys, or credentials.
- Never commit, push, or create PRs unless explicitly asked. Never update git config.
- Before committing: stage intended files only, inspect `git status`, `git diff`, `git log --oneline -10`.

## Text discipline

- No em dashes in UI strings or user-facing content. Use commas, periods, or restructure.
- After editing a content or UI file, grep for em dashes. If found, replace all before finishing.
- Sentence case for UI labels, headings, buttons, toasts. No title case. Only proper nouns keep capitals.
- When editing a content or UI file, sweep the whole file for violations, not just the targeted fix.

### Examples

| bad | good |
| --- | ---- |
| `Get Started Now` | `Get started now` |
| `Loading... Please Wait` | `Loading... please wait` |
| `Delete — this cannot be undone` | `Delete. This cannot be undone.` |
| `AI-powered wiki — built for teams` | `AI-powered wiki, built for teams` |