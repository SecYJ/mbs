# MTS Design Guidelines

Visual language for the Meeting Room Booking System. This document describes
the **Obsidian Editorial** design system — the rules, tokens, and patterns
that any screen in the app must follow. It is intentionally page-agnostic:
use it as a blueprint when designing a screen that does not yet exist.

---

## 1. Design philosophy

The UI is a dark, luxury-concierge aesthetic modelled on the restraint of an
editorial magazine spread rather than a typical SaaS dashboard. Six principles
govern every decision:

- **True-black canvas.** The base is pure `#000`. Depth comes from hairline
  rules and typography, not coloured panels, glass blur, or elevation shadows.
- **Restraint over ornament.** One champagne-gold accent for interactive
  highlights, one electric-lime signal for live state, and a jewel-tone set
  reserved for categorical items (rooms, tags, projects). No gradients on text
  or surfaces.
- **Editorial typography.** A serif italic display voice against a geometric
  sans UI, with a monospaced face for every number a user reads as data
  (times, counts, indices, dates).
- **Hairline architecture.** 1px rules at `rgba(255,255,255,0.08)` define
  columns, cards, and sections. Rounded corners are the exception.
- **Generous vertical rhythm.** Space between sections is large (40–56px);
  space inside a group is tight (12–16px). Whitespace is the primary framing
  device.
- **Slow, staggered entrances.** Content fades up with 700–900ms durations
  and 100–200ms staggers, establishing a readerly pacing cadence on every
  mount.

If a design looks like a generic dark dashboard, one of the six has been
violated. Re-open this document before shipping.

---

## 2. Color palette

All tokens live on the `.dark` root in `src/styles.css`. Always pull from a
token — never hard-code a hex.

### Canvas & surfaces

| Token           | Value     | Usage                                    |
| --------------- | --------- | ---------------------------------------- |
| `--canvas`      | `#000000` | Page background. Everywhere.             |
| `--surface-01`  | `#0a0a0a` | Dialogs, drawers, elevated cards         |
| `--surface-02`  | `#121212` | Nested / hovered cards                   |
| `--surface-03`  | `#1a1a1a` | Most-elevated tertiary surfaces (rare)   |

### Hairlines

| Token                | Value                       | Usage                                 |
| -------------------- | --------------------------- | ------------------------------------- |
| `--hairline`         | `rgba(255,255,255,0.08)`    | Default rules, dividers, borders      |
| `--hairline-strong`  | `rgba(255,255,255,0.16)`    | Section dividers, focused edges       |
| `--hairline-bold`    | `rgba(255,255,255,0.24)`    | Rare — emphasis under titles          |

### Foreground (bone palette)

| Token           | Value     | Usage                                   |
| --------------- | --------- | --------------------------------------- |
| `--bone`        | `#f0ebe0` | Primary text, headings, inputs          |
| `--bone-muted`  | `#a6a29a` | Supporting copy, descriptions           |
| `--bone-dim`    | `#6f6f6b` | Eyebrow labels, inactive nav, meta      |
| `--bone-faint`  | `#3a3a38` | Placeholders, footer colophon           |

### Gold (champagne accent)

| Token                 | Value                       | Usage                                      |
| --------------------- | --------------------------- | ------------------------------------------ |
| `--gold`              | `#dcc4a0`                   | The **only** interactive accent colour     |
| `--gold-soft`         | `#b79e7a`                   | Deeper hover tint                          |
| `--gold-wash`         | `rgba(220,196,160,0.08)`    | Subtle fills, today-highlight              |
| `--gold-wash-strong`  | `rgba(220,196,160,0.14)`    | Hovered wash on data surfaces              |

Use gold for focus states, active indicators, data emphasis (times, selected
tabs, live flourishes), and nothing else. Never as a solid fill on a large
surface.

### Signal (live-state only)

| Token           | Value                       | Usage                                       |
| --------------- | --------------------------- | ------------------------------------------- |
| `--signal`      | `#d7ff3d`                   | "Live" dot, now-indicator, in-progress      |
| `--signal-glow` | `rgba(215,255,61,0.45)`     | Glow on `@keyframes signal-pulse`           |

**Rule:** `--signal` appears at most once or twice per screen, and only on
something that is genuinely live (currently running, currently pulsing).
If it shows up on three elements, step back — something is being misused.

### Categorical accents (jewel tones)

| Token             | Value     | Sample role             |
| ----------------- | --------- | ----------------------- |
| `--room-aurora`   | `#e8c29a` | Amber category          |
| `--room-horizon`  | `#b66a4a` | Rust category           |
| `--room-nimbus`   | `#7a8fa8` | Steel category          |
| `--room-summit`   | `#6a8a6e` | Sage category           |
| `--room-cascade`  | `#8a6a8a` | Plum category           |

Prefixed `--room-` because rooms are the current categorical axis, but the
palette applies to any categorical surface (projects, teams, statuses).
**Always as a 2px left-edge stripe or 1px rule**, never as a fill.

---

## 3. Typography

### Font families

| Role         | Family         | Weights                          | Notes                                  |
| ------------ | -------------- | -------------------------------- | -------------------------------------- |
| Display      | Fraunces       | 400 italic                       | **Always italic, never bold.**         |
| UI / body    | Manrope        | 400 / 500 / 600 / 700 / 800      | Default on `<body>`                    |
| Tabular      | JetBrains Mono | 400 / 500                        | Times, counts, indices, dates          |

All three load from a single Google Fonts `@import` at the top of
`src/styles.css`. Do not add a fourth family.

### Type scale

| Element                      | Size                        | Weight | Tracking        | Case      | Line |
| ---------------------------- | --------------------------- | ------ | --------------- | --------- | ---- |
| Hero statement (immersive)   | `clamp(3.5rem, 7vw, 6rem)`  | 400i   | `-0.02em`       | none      | 0.9  |
| Page heading (serif)         | `2.4rem` – `3rem`           | 400i   | `-0.02em`       | none      | 1.0  |
| Section heading (serif)      | `1.6rem` – `2rem`           | 400i   | `-0.01em`       | none      | 1.1  |
| Body                         | `0.88rem` – `0.95rem`       | 400    | default         | none      | 1.55 |
| Eyebrow label                | `0.64rem`                   | 600    | `0.3em`         | uppercase | —    |
| Nav / small eyebrow          | `0.68rem` – `0.72rem`       | 600    | `0.24em`        | uppercase | —    |
| Button label                 | `0.72rem`                   | 600    | `0.3em`         | uppercase | —    |
| Tabular figure               | `0.7rem` – `1.75rem`        | 500    | `0.1em`–`0.24em`| none      | 1.0  |
| Footer colophon              | `0.62rem`                   | 400    | `0.2em`         | none      | —    |

### Utility classes (in `src/styles.css`)

- `.display-italic` — Fraunces italic, weight 400.
- `.eyebrow` — Manrope, 0.64rem, 600, tracked `0.3em`, uppercase,
  `--bone-dim`.
- `.eyebrow-gold` — chain with `.eyebrow` to recolour to `--gold`.
- `.tabular-num` — JetBrains Mono with `font-variant-numeric: tabular-nums`.

### Typography rules

- Display headings are **always Fraunces italic**. Never upright, never bold.
- Section headers follow the pattern **eyebrow above, italic title below**.
  An eyebrow next to a sans-serif heading breaks the editorial voice.
- Numbers a user reads as data get `.tabular-num`. Numbers inside prose
  sentences do not.
- Tighter tracking for larger display type (`-0.02em`); wider tracking for
  small uppercase (`0.2em`–`0.3em`). **The smaller the text, the more space
  it gets.**
- Wordmarks alongside the monogram use Manrope 600 — the one place upright
  sans stands in for a title.

---

## 4. Layout patterns

Three reusable page shells cover the app. Pick the one that fits the screen's
role; do not invent a fourth without adding it here.

### Pattern A — Immersive split

Use for standalone, focused tasks: sign-in, sign-up, single-field onboarding,
confirmation. Characteristics:

- **58/42 vertical split** at `lg+`.
- Left column (58%): editorial canvas — a serif italic statement anchored
  bottom, hairline margin rule offset 96px from one edge, corner typographic
  anchors (bracket + eyebrow, chapter stamp, folio flourish).
- Right column (42%): centred form max-width **400px**, vertical rhythm
  supplies all structure — no background shift between the two columns.
- Below `lg`, the canvas hides and the form goes full-width with a compact
  top ornament (bracket + eyebrow) for a flavour of the canvas.
- Horizontal padding on the form column: `px-8` → `px-14` → `px-16` → `px-20`
  across the sm → xl breakpoints.
- If you build a sibling page (e.g. two different auth flows), **mirror
  ornaments** across the pair — margin rule swaps sides, bracket moves to the
  opposite corner, chapter/folio numbers advance. Two pages should read like
  a matched editorial spread, not a duplicate.

### Pattern B — App shell with sticky top nav

Use for every authenticated working page. Characteristics:

- Sticky 64px top bar, `bg-black/90` with `backdrop-blur-xl` and a single
  hairline bottom border.
- Left: monogram (gold hairline square) + wordmark in Manrope 600 +
  "Est. {year}" eyebrow.
- Centre/left: nav links as uppercase tracked text (no icons). Active link
  shows a 1px gold underline via an absolutely-positioned span.
- Right: utility actions as 36px hairline squares — no filled backgrounds.
  A notification dot, when present, is `--signal` with `signal-pulse`.
- Main content padding: `px-6 lg:px-10 2xl:px-14`, `py-8 lg:py-10`.

### Pattern C — Editorial masthead for content pages

Use for any page beneath the app shell that presents a dataset, feed, or
workspace. Characteristics:

1. Eyebrow label at the top (e.g. `SECTION · QUALIFIER`) in
   `.eyebrow.eyebrow-gold`.
2. Fraunces italic page title directly below — **never** a rainbow gradient
   title, and never a sans-serif upright heading in this slot.
3. A single hairline rule spanning the content width, separating title from
   content.
4. Optional inline stat strip — each cell is an eyebrow label stacked over a
   tabular figure, separated from its neighbour by a hairline vertical
   divider (`divide-x divide-[var(--hairline)]`).
5. Primary action (if any) sits top-right as an inverted-bone button.

No rounded card wrapper. No coloured background blob behind the masthead.

---

## 5. Component patterns

### Inputs (underline only)

Inputs are the only form element style in the system. Built on the shadcn
`Input` primitive with a `.login-input-underline` class:

```css
.login-input-underline {
  border: 0;
  border-bottom: 1px solid var(--hairline);
  border-radius: 0;
  background: transparent;
  padding-inline: 0.15rem;
  transition: border-color 320ms ease, box-shadow 320ms ease;
}
.login-input-underline:focus {
  border-color: var(--gold);
  box-shadow: 0 1px 0 0 var(--gold);
  outline: none;
}
```

- Height: `h-11` (44px).
- Text: `--bone`; placeholder: `--bone-faint`.
- Label sits **above** the input as an `.eyebrow`, never floating inside.
- Password fields: `Eye` / `EyeOff` toggle positioned absolutely at the
  right (`h-9 w-9` hit area, `tabIndex={-1}` to stay out of keyboard flow,
  hovers to `--gold`).

### Primary CTA — inverted bone

```html
<button class="group relative flex h-12 w-full items-center justify-center gap-3
  border border-[var(--bone)] bg-[var(--bone)]
  text-[0.72rem] font-semibold tracking-[0.3em] uppercase text-black
  transition-all duration-300
  hover:bg-white hover:border-white hover:tracking-[0.34em]">
  <span>Label</span>
  <ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
</button>
```

- Bone fill, black text. Hover brightens to pure white, tracking expands by
  `0.04em`, optional trailing icon slides 4px right.
- **No gradients. No shadows.** Presence comes from weight, not decoration.
- Reserve for the single most important action on the screen.

### Secondary & ghost actions

- Plain uppercase tracked text buttons separated by hairline vertical
  dividers form an editorial tab strip (e.g. `DAY | WEEK | MONTH | YEAR`).
  Active tab gets a 1px gold underline.
- Icon-only navigation controls (chevrons, close, etc.) are hairline-bordered
  32–36px squares with transparent fill, hover brightens border.
- Destructive actions use uppercase tracked text in `--bone-muted` with a
  hover tint to a warmer tone. Never a filled red button.

### Monogram

A square with a 1px `--gold` border and a centred serif italic letterform.
Two sizes in the system:

- **44×44 (`size-11`)** — onboarding/auth contexts, M at `1.35rem`.
- **32×32 (`size-8`)** — app shell nav, M at `0.95rem`.

```html
<div class="inline-flex size-11 items-center justify-center border border-[var(--gold)]">
  <span class="display-italic text-[1.35rem] leading-none text-[var(--gold)]">M</span>
</div>
```

### Categorical chip

Used wherever a categorical tag renders (room legend, status chips, tag
lists):

- `var(--surface-01)` background, 1px `--hairline` border,
  `rounded-none` or `rounded-sm`.
- 2px absolute-positioned left stripe in the category's jewel tone.
- Primary label in Manrope 500; metadata below in `.tabular-num` at a
  smaller size.

### Inline stat tile

- Eyebrow label stacked above a tabular figure in Manrope 500 or 600.
- Adjacent tiles separated by `divide-x divide-[var(--hairline)]`.
- When a stat represents a live count and the count is non-zero, the figure
  recolours to `--signal`.

### Dialog

- Overlay: `bg-black/80`, 4px `backdrop-blur`.
- Panel: `bg-[var(--surface-01)]`, 1px hairline border, `rounded-none`,
  `shadow-[0_40px_80px_rgba(0,0,0,0.6)]`.
- Title: Fraunces italic. Field labels: `.eyebrow`. Inputs inherit
  `.login-input-underline`.
- Tag/badge elements: hairline-bordered rectangles, no fill, uppercase
  tracked text.
- Submit: inverted-bone CTA. Cancel: ghost uppercase tracked text.

### Drawer

- Slides in from a single edge (right or bottom), overlay matches the dialog.
- Panel: `bg-[var(--surface-01)]`, hairline border on the slide-edge side,
  no rounded corners at the outer edges.
- Internal sections divided by hairline rules, each headed by an `.eyebrow`.

---

## 6. Decorative / ornament rules

### Film grain overlay

Every full-screen route may add one SVG noise layer. One instance per route,
with a unique `<filter id>` to avoid collisions:

```html
<svg aria-hidden class="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.016]">
  <filter id="grain-{unique}">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
  </filter>
  <rect width="100%" height="100%" filter="url(#grain-{unique})" />
</svg>
```

Opacity stays at **1.6%**. On pure black, more grain reads as noise.

### Edge vignette

A single fixed radial gradient on `body::before` fades to ~70% black at the
edges — barely perceptible, frames the canvas like a printed page. Already
applied in `styles.css`. **Do not layer additional page-level blobs or
gradients on top of it.**

### Hairline margin rule

A 1px vertical rule at `--hairline`, full-height, offset 96px from one edge
of a canvas column. Animate in with `.hairline-draw-in` on mount. Use in
immersive split layouts only.

### Typographic anchors

Small fixed marks that give an editorial layout its gravity. Each is
positioned absolutely in a corner and fades in with its own delay:

- Corner bracket glyph (`┌` / `┐` / `└` / `┘`) in Fraunces paired with a
  tracked uppercase label.
- Chapter stamp: `CHAPTER` eyebrow + roman numeral / total in `.tabular-num`.
- Folio flourish: `FOLIO` eyebrow + zero-padded index · year in
  `.tabular-num`.

Use at least one of these on any immersive/onboarding screen. Avoid on
content pages — they would compete with the data.

### What not to add

- Coloured mesh blobs or animated gradient backgrounds.
- Glow halos on buttons or icons.
- Glass / backdrop-blur panels as content containers (the app-shell nav is
  the exception).
- Drop shadows on anything other than a modal panel.
- Borders in a category's jewel tone on large surfaces — stripes only.

---

## 7. Animation

### Entrance — `fade-up`

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- Duration: **700ms – 900ms**.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (fast deceleration).
- Fill: `both`.
- Stagger pattern: `100ms → 200ms → 300ms → 450ms → 650ms → 1000ms → 1100ms`.
  Elements in a decorative / ambient column enter slightly later than
  primary-content elements, suggesting an eye-path.

### Hairline draw-in

```css
@keyframes hairline-draw {
  from { transform: scaleY(0); opacity: 0; }
  to   { transform: scaleY(1); opacity: 1; }
}
.hairline-draw-in {
  animation: hairline-draw 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
  transform-origin: top;
}
```

Use on vertical margin rules and section dividers under display headings.

### Signal pulse

```css
@keyframes signal-pulse {
  0%, 100% { opacity: 0.9; box-shadow: 0 0 8px var(--signal-glow); }
  50%      { opacity: 1;   box-shadow: 0 0 14px var(--signal-glow); }
}
```

- Duration: `2.4s`, `ease-in-out`, infinite.
- Only on elements that are genuinely live. Never decorative.

### Transition defaults

| Property       | Duration | Easing |
| -------------- | -------- | ------ |
| `border-color` | 180ms    | ease   |
| `background`   | 180ms    | ease   |
| `color`        | 180ms    | ease   |
| `transform`    | 180ms    | ease   |
| CTA hover      | 300ms    | ease   |
| Input focus    | 320ms    | ease   |

Do not add new keyframes unless `fade-up`, `hairline-draw`, or `signal-pulse`
cannot express the intent.

---

## 8. Spacing conventions

| Context                              | Spacing                             |
| ------------------------------------ | ----------------------------------- |
| Logo block → heading                 | `mb-14` (56px)                      |
| Eyebrow → serif title                | `mt-3` (12px)                       |
| Title → supporting copy              | `mt-4` (16px)                       |
| Supporting copy → form / content     | `mt-10` – `mt-12` (40–48px)         |
| Between form field groups            | `space-y-7` / `space-y-8` (28–32px) |
| Label → input                        | `space-y-3` (12px)                  |
| CTA container top padding            | `pt-2` – `pt-4`                     |
| Content block → secondary divider    | `mt-10` – `mt-12`                   |
| Immersive canvas inner padding       | `px-20 pb-20`                       |
| Hairline rule length under headings  | `w-48`                              |

Rule of thumb: **generous between sections (40–56px), tight within groups
(12–16px).** Use `space-y-*` for vertical stacks so visual weight reads
correctly — do not substitute `gap-*` on a flex column for the same effect.

---

## 9. Third-party skins

When integrating a third-party widget (calendar, table library, chart), skin
it to the system rather than theming around its defaults:

- Grid lines, borders, separators → `var(--hairline)`.
- Column / row headers → `.eyebrow` style (uppercase tracked, `--bone-dim`).
- Data cells / time labels → `.tabular-num`.
- Emphasis on "today" or "current" → `--gold-wash` background + `--gold`
  foreground on the label.
- Event / item blocks → a 2px left-edge stripe in the category accent,
  `rgba(accent, 0.06)` wash, `--bone` title. Hover raises the wash to
  `0.10`. No glow, no shadow, no gradient fill.
- Live indicators (now-line, running status) → `var(--signal)` with
  `signal-pulse` where motion is appropriate.

Add the override block to `src/styles.css`, scoped under a theme class on
the widget wrapper.

---

## 10. Accessibility

- All decorative SVGs, ornaments, and hairline rules use `aria-hidden`.
- Form inputs pair with `<Label htmlFor=...>` — the eyebrow styling does
  not remove the semantic label.
- Password toggles use `tabIndex={-1}` so keyboard flow goes input → input.
- Contrast: `--bone` on `--canvas` is ~18:1 (WCAG AAA). `--bone-dim` on
  `--canvas` is ~5.3:1 (WCAG AA) — keep eyebrow text at ≥ 0.64rem so the
  ratio holds at its smallest use.
- `--signal` is always paired with either motion (`signal-pulse`) or an
  explicit text label — never the sole signal of state.
- Focus states: inputs shift to a `--gold` underline; inverted-bone CTAs
  brighten to pure white with wider tracking. Both are visible without
  a focus ring, but do not disable focus rings globally.

---

## 11. Checklist for new screens

Before merging a new screen, walk every point:

1. **Canvas is `--canvas` (#000)**, with at most one grain SVG on top.
2. **Typography is Fraunces italic + Manrope + JetBrains Mono.** Headings
   are italic; data numbers are tabular.
3. **Gold is the only interactive accent.** Signal lime is rare and live.
   Jewel tones stay on 2px stripes.
4. **Every section starts with an eyebrow + italic title.** No eyebrow
   paired with a sans-serif heading.
5. **CTAs are inverted bone.** Secondary actions are uppercase tracked
   text, not filled buttons.
6. **Hairlines, not boxes.** Rounded cards only where load-bearing; dialogs
   are `rounded-none`.
7. **Entry animates with `fade-up` + 100–200ms stagger.** No new keyframes
   unless the existing three cannot express the intent.
8. **No mesh blobs, no glow, no glass blur, no gradient titles, no drop
   shadows on inline elements.**
9. **Chose a layout pattern (A, B, or C) from §4.** If none fit, document a
   new pattern here in the same commit.
10. **Added or changed a token, class, or pattern?** Update the relevant
    section of this document in the same PR.

---

## 12. Where things live

- `src/styles.css` — all tokens, utility classes, keyframes, third-party
  skin overrides.
- `src/components/ui/` — shadcn/Radix primitives. Restyling lands via
  class strings, not by editing primitives.
- Route files in `src/routes/` use these tokens/classes directly. If you
  find yourself writing a new `.something` helper, add it to `styles.css`
  and document it in §3 or §5 here.
