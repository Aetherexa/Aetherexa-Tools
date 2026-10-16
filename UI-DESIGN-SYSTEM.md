# Aetherexa UI — Shared website design language

This site follows the same disciplined workbench UI approach as **Copilot Toolkit**: tokenised dark surfaces, clear control states, restrained accent use, compact yet readable cards, consistent border/radius/elevation, and accessible keyboard focus.

## Where to edit

- \`src/styles/aetherexa-ui.css\`: reusable design-system foundation. Change tokens here for brand-wide updates.
- \`src/styles/global.css\`: legacy site layout and specialized visual treatments.
- \`src/layouts/Base.astro\`: theme delivery and shared shell; embeds both CSS layers into static HTML.
- \`src/components/*.tsx\`: utilities all use shared \`.panel\`, \`.field\`, \`.btn\`, \`.notice\`, and table styles.

## Core tokens

\`--ax-bg\`, \`--ax-surface-0\`, \`--ax-surface\`, \`--ax-surface-raised\`, \`--ax-input\`, \`--ax-border\`, \`--ax-text\`, \`--ax-muted\`, \`--ax-accent\`, \`--ax-radius\`, \`--ax-shadow\`.

## Design principles

1. Consistent surfaces: the canvas is darkest, cards sit above it, editable controls have a deliberate separate surface.
2. Clear states: focus, hover, disabled, success, warning and error are visible without animation.
3. Mobile-first functionality: tools remain usable on narrow screens; multi-column panels collapse into one column.
4. No remote CSS/font dependency: initial presentation must survive CSS asset routing mistakes.
5. No misleading claims: tools process locally; accessibility and visual quality are gated by CI and manual review.
6. Cross-product interoperability: use the same token semantics when translating the UI to VS Code variables (e.g. \`--ax-bg\` to \`--vscode-editor-background\`).

## Verification

\`npm run build && npm run verify:build\` checks the CSS is embedded in every rendered page. Playwright's UI regression checks all seven routes for computed styles. Check desktop/mobile manually before release and run the accessibility suite.
