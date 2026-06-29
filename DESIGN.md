---
name: Museum Collage
description: A dark, image-first baseline waiting to become a tactile collage table.
colors:
  base-100: "#0a0a0a"
  base-200: "#111111"
  base-300: "#1a1a1a"
  base-content: "#e5e5e5"
  primary-placeholder: "#5b5bf0"
  primary-content: "#e8e6fb"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
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
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
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
    backgroundColor: "{colors.primary-placeholder}"
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

The system today rejects: generic SaaS-dashboard chrome (sidebars, charts, blue-on-white corporate UI), sterile institutional museum stiffness, cluttered control-heavy surfaces, and anything childish or cartoonish. Where it currently risks the *first* of those — the accent is an unowned default blue — that is flagged below.

**Key Characteristics:**
- Near-black surfaces (`#0a0a0a`–`#1a1a1a`) so artwork is the only color.
- One sans family (Geist) carries everything; no display/body pairing yet.
- Standard, restrained affordances — nothing reinvented, nothing decorative.
- The accent is a placeholder, not a brand decision.
- Tactility (drag, layer, rotate) is aspirational and not yet built.

## 2. Colors

A monochrome near-black ramp with a single accent. The art supplies all the chroma; the UI supplies none.

### Primary
- **Placeholder Indigo** (`#5b5bf0` ≈ `oklch(58% 0.233 277.117)`): DaisyUI 5's *inherited default* primary. Used for primary buttons (`btn-primary`: "Get started", "Save to board"), focus-ring outlines on the search field, and avatar initials. **This is not yet a brand color** — it is an unowned default carried over from the framework. Treat every use of it as a placeholder to be replaced when the tactile/collage palette is chosen.
- **Primary Content** (`#e8e6fb` ≈ `oklch(96% 0.018 272.314)`): foreground text/initials on primary surfaces.

### Neutral
- **Base 100 — Ink Black** (`#0a0a0a`): the page background and navbar surface. The darkroom floor.
- **Base 200 — Raised Black** (`#111111`): cards, search field, image wells, modal image column. The second tonal layer; depth is conveyed by tonal lift, not shadow.
- **Base 300 — Lifted Black** (`#1a1a1a`): the highest tonal layer for nested raised surfaces.
- **Base Content — Soft White** (`#e5e5e5`): body and heading text. Muted variants are expressed as opacity (`/70`, `/60`, `/50`, `/40`) rather than separate gray tokens.

### Named Rules
**The Art-Is-The-Only-Color Rule.** The UI palette is intentionally monochrome. Every saturated pixel on screen should come from an artwork, never from chrome. If a UI element is competing with the art for color attention, it is wrong.

**The Placeholder-Accent Rule.** The current indigo is a framework default, not a decision. Do not build brand meaning on it, and do not propagate it into new surfaces as if it were chosen. It is on borrowed time.

## 3. Typography

**Display Font:** Geist (with `system-ui, sans-serif`)
**Body Font:** Geist (same family)
**Label/Mono Font:** Geist Mono (with `ui-monospace, monospace`) — loaded but barely used today.

**Character:** A single, neutral, modern geometric sans carries the entire interface — headings, body, labels, buttons. This is the right instinct for a product surface (one well-tuned sans does the whole job), but it is also *quiet to a fault*: there is no typographic personality yet to carry the "playful, tactile" voice the brand wants. Type is currently a workhorse, not a voice.

### Hierarchy
- **Display** (700, ~3rem / `text-5xl`, line-height ~1.1, letter-spacing -0.025em): the landing hero ("Your personal art collection"). The single largest type moment.
- **Title** (700, 1.5rem / `text-2xl`): dashboard page heading ("Explore Art").
- **Heading** (700, 1.25rem / `text-xl`): artwork modal title.
- **Body** (400, 1rem): descriptions and prose. Cap prose at 65–75ch; the landing sub-copy already constrains with `max-w-md`.
- **Label** (500–600, 0.875rem / `text-sm`): buttons, metadata, search input, dropdown items.

### Named Rules
**The One-Family Rule.** One sans (Geist) does everything. Do not introduce a second similar sans. If the system ever earns a display face, it must contrast on a real axis (serif, or a humanist/quirky display against Geist's geometry) — never a second near-identical geometric sans.

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
- **Primary:** placeholder-indigo fill with primary-content text (`btn btn-primary`). Used for the single most important action on a surface ("Get started", "Save to board").
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
- **Focus:** a 2px `--color-primary` outline with 1px offset (currently the placeholder indigo).
- **Placeholder:** `base-content` at 40% opacity.

### Navigation (AuthNavbar)
- **Style:** sticky top bar, `base-100`, three-column grid (logo / search / avatar), 4rem tall, capped at 72rem and centered.
- **Logo:** 1.25rem, weight 600, -0.025em tracking; hover lifts to `base-200`.
- **Avatar menu:** circular avatar (image or initials on placeholder-indigo); a `focus-within` dropdown panel (`base-100`, `0.75rem` radius, floating shadow) lists the email, "Saved", and a danger-colored sign-out.

### Modal (Artwork Detail)
- **Native `<dialog>`** (DaisyUI `modal`), opened imperatively. Two-column at `md+` (image well `base-200` left, scrollable detail right), stacked on mobile, capped at `85vh` so it stays landscape. Detail content loads behind a skeleton (`skeleton` bars), never a centered spinner. Closes via backdrop click or the ghost ✕.

## 6. Do's and Don'ts

### Do:
- **Do** keep the UI monochrome — let every saturated color come from the artwork (the Art-Is-The-Only-Color Rule).
- **Do** convey depth by stepping the near-black ramp (`#0a0a0a` → `#111111` → `#1a1a1a`), not by adding shadows.
- **Do** use skeleton loaders for content, never a spinner parked in the middle of empty space.
- **Do** keep one sans (Geist) across the UI; if a display face is ever added, contrast it on a real axis.
- **Do** treat the indigo accent as a placeholder and design its replacement when the tactile palette is chosen.

### Don't:
- **Don't** build brand meaning on the current `#5b5bf0` indigo — it is an inherited DaisyUI default, not a chosen color.
- **Don't** drift toward a **generic SaaS dashboard**: no sidebars, charts, blue-on-white corporate chrome, or Inter-everywhere flatness.
- **Don't** make it feel like a **sterile institutional museum site** — stiff, formal, gray, bureaucratic. This is a personal space.
- **Don't** clutter surfaces with controls, badges, or chrome that competes with the art (the art needs room to breathe).
- **Don't** chase "playful" with **childish or cartoonish** moves — bubbly shapes, primary-color palettes, gimmicks. Charm must come from craft and tactility.
- **Don't** add decorative shadows, gradient text, side-stripe borders, or glassmorphism.
