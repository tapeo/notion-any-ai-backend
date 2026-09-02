## Change

Replace the ProductPreview placeholder with the real app screenshots added to `public/`.

## Decisions

- Light/dark variants swap via `dark:hidden` / `dark:block`, same pattern as `app-store-badge.tsx`.
- Explicit `width={2152} height={1622}` from the actual PNG dimensions to prevent layout shift, scaled with `h-auto w-full`.
- Kept the browser chrome bar above the image.

## Files

- `components/landing/product-preview.tsx` (modified)
