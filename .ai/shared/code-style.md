# Code style

Language-agnostic rules that apply in every kit. Platform-specific style (framework APIs, file-type naming tables, lint configs) lives in the kit `.ai/` docs.

## Inline conditions

Never use inline ternary operators. Always use if/else blocks.

```
// Bad
const label = isLoading ? 'Saving...' : 'Save';

// Good
let label: string;
if (isLoading) {
  label = 'Saving...';
} else {
  label = 'Save';
}
```

In markup, extract to a component or a function that returns the value or the node.

## Lint suppression

Never use lint-disable comments (`// ignore:`, `// eslint-disable-next-line`, or equivalents) to silence warnings. Fix the underlying issue.

## Barrel files

Import files directly. Only create a barrel file (`index.dart`, `index.ts`, `exports.dart`) when a feature has 5+ modules to re-export, and keep it as `export` statements only, no logic.

## Imports

- Prefer absolute imports for intra-project references. They survive folder moves and stay readable at depth. Follow the kit `conventions.md` for the exact form (`package:my_app/...`, `@/...`).
- Group imports: platform/built-ins first, then third-party packages, then project-internal. Separate groups with a blank line.

## File size

Max ~350-400 lines per file, excluding comments, blank lines, and imports. When approaching the limit:

- Extract utility functions into dedicated files with descriptive names.
- Separate components/widgets into their own files.
- Consolidate similar functionality to avoid duplication.
- Use meaningful file names (`user-authentication.ts` instead of `index.ts`).

## Naming

- Constants at file scope: `SCREAMING_SNAKE_CASE`.
- Database fields and JSON keys: `snake_case`.
- In-memory fields: `camelCase` (or the language convention the kit defines).
- Before creating a new file, search for an existing implementation. Refactor into a shared function or component instead of copy-pasting.

## Duplication

Search for existing implementations before creating new files. Refactor duplicated logic into reusable functions, components, or hooks.

## Simplicity

- No useless or redundant code. Fewest lines possible to solve the problem.
- No complex or flaky workarounds. Simplify if the implementation feels too large.
- No premature abstraction. Solve the concrete case first.
- One function does one thing. Small functions, clear flow.
- Flat over nested. Prefer early returns and guard clauses over nested blocks.

## Comments

- Do not write inline comments in the middle of code blocks, and do not write comments above methods, functions, or variables.
- If a line needs a comment to be understood, rewrite the line instead.
- When refactoring, remove comments that no longer match the code. Do not leave stale comments.

## Clarity

- Readable on first pass. No clever tricks, no dense one-liners.
- Name things so intent is obvious. No abbreviations or cryptic variables.
- Extract named predicates for non-trivial conditions. The call site reads as intent, not logic.
- No boolean soup in markup. Compute named booleans before the return, not inline.
- Separate logically distinct statements with a blank line. Consecutive lines must be tightly related.

## Build and environment

- Prefer project-provided wrapper scripts (e.g., `npm.sh`) over running package managers or `docker` directly on the host when the project provides them.
- Run tests and other project commands through the project's configured scripts.

## TypeScript minima

Applies when writing TypeScript in any project, including work outside the kits.

- Strict mode: never disable.
- `interface` for object shapes, `type` for unions, primitives, and mapped types.
- Explicit return types on exported functions.
- Import group order: Node.js built-ins, third-party libraries, absolute path aliases (`@/*`), relative imports. Blank line between groups.
- File naming: kebab-case for modules and routes, PascalCase for components. Types and interfaces in PascalCase.