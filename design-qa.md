# Design QA

- Source visual truth: `public/brand-concepts/anrivers-icon-02-river-a-flat.png`
- Implementation screenshots: `logo-implementation-desktop.png`, `logo-implementation-mobile.png`, `logo-implementation-footer-mobile.png`
- Combined comparison evidence: `logo-design-qa-comparison.png`
- Viewports: 1440 × 900 desktop and 390 × 844 mobile
- State: public homepage with the ANRIVERS header and footer brand lockups

## Full-view comparison evidence

The 1440 × 900 implementation keeps the existing three-column header balance and places the selected River A mark beside the ANRIVERS wordmark without shifting the navigation or RFQ action. The 390 × 844 implementation keeps the mark and wordmark legible while leaving clear space for the mobile menu.

## Focused region comparison evidence

The combined comparison shows the selected navy-and-green River A source beside the rendered homepage and a focused header crop. The implementation uses the source asset directly, preserves its transparent background, and does not reconstruct the mark with CSS or inline SVG.

## Required fidelity surfaces

- Fonts and typography: existing Manrope/DM Sans brand hierarchy is preserved; ANRIVERS and RF CONTROL remain legible at both tested breakpoints.
- Spacing and layout rhythm: the mark aligns optically with the two-line wordmark; desktop and mobile header heights remain unchanged.
- Colors and visual tokens: the asset uses only navy `#071B33` and signal green `#53E39A`, matching the site tokens.
- Image quality and asset fidelity: a 512 × 512 transparent PNG is rendered at 40px desktop and 34px mobile with no visible halo or stretching.
- Dark-surface contrast: the footer uses a dedicated white-and-signal-green reversed asset, keeping the complete River A silhouette visible against navy.
- Copy and content: default public brand text, metadata, Open Graph text, and the editable settings fallback now use ANRIVERS.
- Responsiveness: navigation and mobile menu do not overlap the wider brand lockup.
- Browser identity: generated `favicon.ico` and `icon.png` are present and linked by Next.js metadata.

## Findings

No actionable P0, P1, or P2 findings remain.

## Patches made

- Added a shared `BrandLogo` component for the homepage, catalogue/detail header, footer, and 404 page.
- Added the selected River A image as the public brand asset.
- Added favicon and application icon assets.
- Updated default brand settings, SEO metadata, and the database default/migration from RIVERS to ANRIVERS.
- Verified a successful production build and desktop/mobile browser rendering.
- Added and browser-verified a dedicated reversed icon after the original navy mark lacked contrast in the dark footer.

## Follow-up polish

- [P3] A vector master could be commissioned later for very large-format print and manufacturing artwork; the website asset is crisp at its intended sizes.

final result: passed

---

# Admin product search icon alignment QA

- Source visual truth path: `/tmp/rivers-ui-qa/source-target.png`
- Implementation screenshot path: `/tmp/rivers-ui-qa/implementation-full.png`
- Full-view comparison evidence: `/tmp/rivers-ui-qa/full-comparison.png`
- Focused region comparison evidence: `/tmp/rivers-ui-qa/focus-comparison.png`
- Viewport: 1048 × 460
- State: authenticated admin product catalogue with the default search, category, and status filters

## Findings

No actionable P0, P1, or P2 findings remain. The source search icon was centered against a 58px stretched grid item, placing its center 9px below the 40px input center. The implementation constrains the icon wrapper to 40px, and measured icon/input centers now match exactly.

## Required fidelity surfaces

- Fonts and typography: unchanged.
- Spacing and layout rhythm: the search input, filter columns, card, and table retain their existing dimensions; only the icon positioning context changed.
- Colors and visual tokens: unchanged.
- Image quality and asset fidelity: the existing Lucide search icon remains unchanged and renders sharply.
- Copy and content: unchanged.
- Interaction and responsiveness: form controls and URL-based filtering remain intact; the fixed 40px wrapper matches the input height at all breakpoints.

## Patches made since the previous QA pass

- Added `h-10` to the relative search-icon wrapper.
- Recorded the alignment rule in `AGENTS.md`.
- Ran a successful production build.

final result: passed
