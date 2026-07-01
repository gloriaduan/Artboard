---
name: Museum Collage
description: An image-first surface with a three-voice type system (Fraunces serif display, Geist sans, Geist Mono placards) growing toward a tactile collage table.
colors:
  base-100: "#0a0a0a"
  base-200: "#111111"
  base-300: "#1a1a1a"
  base-content: "#e5e5e5"
  primary: "#c63d00"
  primary-dark: "#f36730"
  primary-content: "#fffaf8"
typography:
  hero:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.5rem, 6vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  pageTitle:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  sectionTitle:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  cardTitle:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  placardLabel:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.06em"
    textTransform: "uppercase"
  placardValue:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-content}"
    rounded: "{rounded.sm}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.base-content}"
    rounded: "{rounded.sm}"
  artwork-card:
    backgroundColor: "{colors.base-200}"
    rounded: "{rounded.sm}"
  search-input:
    backgroundColor: "{colors.base-200}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.sm}"
---

# Design System: Museum Collage

## 1. Overview

**Creative North Star: "The Collage Table (baseline)"**

This file documents what is *currently* on screen, not where the product is headed. The shipped surface is a quiet, near-black DaisyUI dark theme: a clean, image-first stage where artwork is the only saturated thing in the room. It is honest, serviceable, and restrained — but it is explicitly a **starting point**, not the destination.

The destination, per `PRODUCT.md`, is **playful, tactile, collage-y**: a scrapbook/pinboard surface where pieces can be grabbed, layered, rotated, and arranged by hand. None of that tactility exists yet. So read this system as the bare table before the collage is laid out: the lighting is right (dark, so art glows), but the paper, tape, overlap, and hand-made warmth are still to come. When the tactile direction lands, re-run `/impeccable document` and this North Star should change.

The system today rejects: generic SaaS-dashboard chrome (sidebars, charts, blue-on-white corporate UI), sterile institutional museum stiffness, cluttered control-heavy surfaces, and anything childish or cartoonish. The former SaaS-blue risk is now resolved: the accent is an *owned* warm vermilion (§2), the first committed step toward the tactile/collage direction.

**Key Characteristics:**
- Near-black surfaces (`#0a0a0a`–`#1a1a1a`) so artwork is the only color.
- A three-voice type system: Fraunces serif for display/wordmark, Geist sans for body/UI, Geist Mono for museum-placard metadata.
- Standard, restrained affordances — nothing reinvented, nothing decorative.
- The accent is an owned, warm vermilion — a committed brand decision, not a default.
- Tactility (drag, layer, rotate) is aspirational and not yet built.

## 2. Colors

A monochrome near-black ramp with a single accent. The art supplies all the chroma; the UI supplies none.

### Primary
- **Tape Vermilion** — the *owned* brand accent (hue ~38, a warm red-orange). It reads like masking tape, a paint stroke, or a wax seal: hand-made and tactile, warm and personal, never institutional — the first committed step toward the collage direction. It appears only on primary action (`btn-primary`: "Get started", "Save to board"), current selection, focus rings, links, and avatar initials — never as decoration. Two theme-tuned values, each cleared for AA:
  - Light: `#c63d00` (`oklch(55.5% 0.185 38)`) — darkened so it reads as link/label text on the near-white surface (≈4.95:1 on `base-100`, 4.66:1 on `base-200`).
  - Dark: `#f36730` (`oklch(68% 0.185 40)`) — brightened for dark-on-light legibility (≈6.3:1 on `base-100`), chroma held high so it glows without competing with the artwork.
  Kept clear of the crimson `error` hue (22) by leaning orange (38), so accent and error never read as the same red.
- **Primary Content** (`#fffaf8` light / `#150a08` dark): foreground text/initials on primary surfaces (≥5:1 both themes).

### Neutral
- **Base 100 — Ink Black** (`#0a0a0a`): the page background and navbar surface. The darkroom floor.
- **Base 200 — Raised Black** (`#111111`): cards, search field, image wells, modal image column. The second tonal layer; depth is conveyed by tonal lift, not shadow.
- **Base 300 — Lifted Black** (`#1a1a1a`): the highest tonal layer for nested raised surfaces.
- **Base Content — Soft White** (`#e5e5e5`): body and heading text. Muted variants are expressed as opacity (`/70`, `/60`, `/50`, `/40`) rather than separate gray tokens.

### Named Rules
**The Art-Is-The-Only-Color Rule.** The UI palette is intentionally near-monochrome. Every *saturated* pixel on screen should come from an artwork, never from chrome. The lone exception is Tape Vermilion, used sparingly and only for action/selection/focus — if any other UI element competes with the art for color attention, it is wrong.

**The Vermilion-Is-Earned Rule.** The accent is a committed brand color, but it earns its place by scarcity. Use it for primary action, current selection, focus, and links — never to decorate, tint surfaces, or fill inactive states. Neutrals carry only a *faint* warm tint toward hue 38 (chroma ≤0.009) for cohesion; they must never read as colored.

## 3. Typography

**A three-voice system.** Type now carries the brand voice it was missing.

**Display Font:** Fraunces (with `Georgia, "Times New Roman", serif` fallback) — an expressive, old-style variable serif with optical sizing and a soft axis. Loaded via `next/font` as `--font-fraunces`, bound to the `--font-display` theme token so `font-display` is a Tailwind utility.
**Body/UI Font:** Geist (with `ui-sans-serif, system-ui, sans-serif`) — the quiet workhorse for body, buttons, labels, inputs.
**Placard Font:** Geist Mono (with `ui-monospace, monospace`) — now the "museum wall-label" voice for artwork metadata and numerics.

**Character:** Fraunces gives headings and the wordmark a warm, hand-made, gallery-placard character that fits the "playful, tactile, collage-y" brand; it contrasts with Geist on a real axis (serif vs. geometric grotesque, old-style vs. neo-grotesque). Geist recedes as the neutral UI workhorse. Geist Mono supplies catalogue-card texture on the metadata that describes each work. The art is still the hero — the serif lives in chrome, sized and coloured so it never competes with the images.

### Hierarchy (fixed `rem` scale, ~1.25 ratio; only the hero is fluid)
- **Hero** (Fraunces 600, `clamp(2.5rem, 6vw, 3.5rem)`, line-height 1.05, tracking -0.01em, `text-wrap: balance`): the landing headline. The single largest type moment; clamp max is bounded (≤3.5rem, ≤~2.5× the min) for safe zoom/reflow.
- **Page title** (Fraunces 600, 1.875rem / `text-3xl`, tracking -0.01em): "Explore Art", "Saved Artworks", "My Boards", and the artwork/auth modal titles were unified up to the section scale.
- **Section / modal title** (Fraunces 500, 1.5rem / `text-2xl`): modal headings (Sign in, Create an account, Add images, Unsaved changes), artwork modal title.
- **Card / board title** (Geist 600, `text-base`/`text-lg`): artwork-card overlay title, board card names, board-canvas toolbar title. Stays sans for legibility at small sizes and over imagery.
- **Body** (Geist 400, 1rem): descriptions and prose. Cap prose at 65–75ch; landing sub-copy constrains with `max-w-md`.
- **Label / UI** (Geist 500, 0.875rem / `text-sm`): buttons, search input, dropdown items, form labels.
- **Placard label** (Geist Mono 500, 0.75rem / `text-xs`, uppercase, tracking 0.06em): the `<dt>` terms in the artwork modal's metadata block (Medium, Dimensions, Culture, Credit).
- **Placard value / numeric** (Geist Mono 400, `text-xs`/`text-sm`, `tabular-nums` where numeric): metadata values, artwork date, board zoom %, board artwork counts.

### Named Rules
**The Three-Voice Rule.** Display = Fraunces serif (headings + wordmark), body/UI = Geist sans, placard = Geist Mono (metadata + numerics). Exactly three families — no fourth, and no second geometric sans that would blur against Geist. A new heading uses `font-display`; catalogue-style metadata and any tabular number uses `font-mono`; everything else is the default sans.

**The Art-Stays-Hero Rule (typographic corollary).** The serif is chrome only. Never set it over an artwork in a way that competes with the image, and keep placard mono small and low-contrast — it labels the art, it doesn't shout.

## 4. Elevation

This is a **flat, tonal system**. Depth is conveyed almost entirely by stepping through the near-black ramp (`base-100` → `base-200` → `base-300`), not by shadows. The few shadows that exist are functional, reserved for genuinely floating UI: the sticky navbar's hairline (`0 1px 3px rgba(0,0,0,0.3)`) and the account dropdown's lift (`0 4px 20px rgba(0,0,0,0.4)`). The modal relies on the native `<dialog>` backdrop, not a custom shadow.

### Shadow Vocabulary
- **Navbar hairline** (`box-shadow: 0 1px 3px rgba(0,0,0,0.3)`): separates the sticky top bar from scrolling content.
- **Floating panel** (`box-shadow: 0 4px 20px rgba(0,0,0,0.4)`): the account dropdown only.

### Named Rules
**The Tonal-Depth Rule.** Layer surfaces by stepping the black ramp, not by stacking shadows. A shadow appears only when an element genuinely floats above the page (sticky nav, dropdown, modal). Decorative shadows are forbidden.

## 5. Components

### Buttons
- **Shape:** gently rounded (`0.5rem`, DaisyUI `btn` default).
- **Primary:** Tape Vermilion fill with primary-content text (`btn btn-primary`). Used for the single most important action on a surface ("Get started", "Save to board").
- **Ghost:** transparent, inherits text color, subtle hover (`btn btn-ghost`). Used for secondary actions ("Explore artworks") and icon buttons (modal close).
- **Saved/toggle state:** a saved artwork's button switches to `btn-outline` with a "Saved ✓" label; a loading spinner (`loading-spinner`) shows during the pending transition.

### Cards (Artwork Card)
- **Corner Style:** `0.5rem` (`rounded-lg`), fully clipped (`overflow-hidden`).
- **Background:** `base-200` well behind a lazy-loaded `<img>` at a fixed `3/4` aspect ratio.
- **Hover behavior:** the image scales to `1.05` over 300ms, and a bottom-anchored `from-black/70` gradient overlay fades in (0 → 100% opacity) revealing title / artist / date in white. **Metadata is hidden at rest and revealed on hover** — the card is silent until you approach it.
- **Empty state:** images that are missing render a centered "No image available" label on the `base-200` well, same footprint.
- **Shadow Strategy:** none. Flat per the Tonal-Depth Rule.

### Inputs (Search)
- **Style:** `base-200` fill, 1px hairline border (`base-content` at 15%), `0.5rem` radius, leading magnifier icon at 50% opacity.
- **Focus:** a 2px `--color-primary` outline with 1px offset (Tape Vermilion).
- **Placeholder:** `base-content` at 40% opacity.

### Navigation (AuthNavbar)
- **Style:** sticky top bar, `base-100`, three-column grid (logo / search / avatar), 4rem tall, capped at 72rem and centered.
- **Logo:** 1.25rem, weight 600, -0.025em tracking; hover lifts to `base-200`.
- **Avatar menu:** circular avatar (image or initials on Tape Vermilion); a `focus-within` dropdown panel (`base-100`, `0.75rem` radius, floating shadow) lists the email, "Saved", and a danger-colored sign-out.

### Modal (Artwork Detail)
- **Native `<dialog>`** (DaisyUI `modal`), opened imperatively. Two-column at `md+` (image well `base-200` left, scrollable detail right), stacked on mobile, capped at `85vh` so it stays landscape. Detail content loads behind a skeleton (`skeleton` bars), never a centered spinner. Closes via backdrop click or the ghost ✕.

## 6. Do's and Don'ts

### Do:
- **Do** keep the UI near-monochrome — let every saturated color come from the artwork, with Tape Vermilion the one owned accent, used only for action/selection/focus (the Art-Is-The-Only-Color Rule).
- **Do** convey depth by stepping the near-black ramp (`#0a0a0a` → `#111111` → `#1a1a1a`), not by adding shadows.
- **Do** use skeleton loaders for content, never a spinner parked in the middle of empty space.
- **Do** keep the three-voice system (Fraunces display, Geist body/UI, Geist Mono placards) and its real-axis serif/sans contrast; don't add a fourth family or a second geometric sans.
- **Do** build on Tape Vermilion as the committed accent, and keep it scarce (action / selection / focus only) so it stays powerful (the Vermilion-Is-Earned Rule).

### Don't:
- **Don't** spread the vermilion into surfaces, inactive states, or decoration — scarcity is what makes it read as intentional, not corporate.
- **Don't** drift toward a **generic SaaS dashboard**: no sidebars, charts, blue-on-white corporate chrome, or Inter-everywhere flatness.
- **Don't** make it feel like a **sterile institutional museum site** — stiff, formal, gray, bureaucratic. This is a personal space.
- **Don't** clutter surfaces with controls, badges, or chrome that competes with the art (the art needs room to breathe).
- **Don't** chase "playful" with **childish or cartoonish** moves — bubbly shapes, primary-color palettes, gimmicks. Charm must come from craft and tactility.
- **Don't** add decorative shadows, gradient text, side-stripe borders, or glassmorphism.
