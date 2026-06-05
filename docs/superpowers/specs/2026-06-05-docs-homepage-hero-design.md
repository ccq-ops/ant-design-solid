# Docs Homepage Hero Redesign

## Goal

Redesign the docs homepage around the provided blue-purple glassmorphism technology image. The homepage should feel more like a polished product landing page while still serving as an efficient documentation entry point.

## Chosen Direction

Use direction B: a centered, high-impact promotional hero.

The first screen will center the product message and calls to action over a soft blue-purple glassmorphism visual field. The provided image should be used as the main hero banner image, either as a large centered visual behind the copy or as a dominant image layer immediately below the copy.

## Scope

- Update `apps/docs/src/pages/index.tsx` only unless an image asset import or small CSS utility requires an adjacent file.
- Preserve the existing docs shell, router, top navigation, and sidebar behavior.
- Preserve existing CTA behavior:
  - `Get Started` navigates to `/docs/getting-started`.
  - `View Components` navigates to `/components/affix`.
- Add the provided image to the docs app asset tree using a kebab-case filename, for example `hero-banner.png`.
- Keep all new TypeScript filenames kebab-case if new files are needed.

## Page Structure

1. **Centered Hero**
   - Small pill badge: `SolidJS · Design System · Token Driven`.
   - Large headline: a concise product-focused Ant Design Solid message.
   - Supporting paragraph explaining Ant Design semantics, Solid-native performance, and token-driven theming.
   - Two centered CTAs using existing `Button` components.
   - Main hero image integrated as a large atmospheric banner with rounded corners, soft shadows, and blue-purple gradients.

2. **Feature Cards**
   - Three cards below the hero:
     - Component-rich: broad Ant Design-inspired component coverage.
     - Token-driven theming: ConfigProvider and design token customization.
     - Solid-native runtime: SolidJS-first implementation and CSS-in-JS runtime.

3. **Component Preview Section**
   - A compact section that demonstrates the library with real components where practical.
   - Keep it lightweight and static so the homepage remains fast and maintainable.

## Visual Direction

- Use the image palette: airy white, light blue, saturated Ant Design blue, violet accents, and glass-like translucent layers.
- Use generous spacing, large rounded corners, subtle borders, and layered shadows.
- The hero should feel immersive and modern, not cluttered.
- The homepage should remain readable in the existing docs dark theme by relying on current theme variables and dark-mode override patterns where possible.

## Testing and Verification

Update or add tests for the homepage to assert:

- The main `Ant Design Solid` heading remains present.
- The hero keeps the expected landing-page classes or semantic structure.
- Both CTA buttons render.
- CTA navigation still targets the existing routes.
- New feature/preview copy renders.

Run the repository verification commands after implementation:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

## Open Implementation Note

The chat-provided image must be available as a local file before implementation can import it directly. If the image is not already present in the repository or attachment workspace, request a local file path or add it manually to `apps/docs/src/assets/hero-banner.png` before wiring the import.
