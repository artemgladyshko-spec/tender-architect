---
name: ui-design-tokens
description: Defines global design tokens used to control application styling such as colors, spacing, typography, and component radius.
---

# Design Tokens

Design tokens define global styling values used across the application.

They allow visual styles to be changed in a single place.

---

# Token Categories

Common token groups:

colors  
spacing  
typography  
border radius  
shadows

---

# Color Tokens

Example:

color.primary
color.background
color.surface
color.text.primary
color.text.secondary
color.border

Components must use tokens instead of hardcoded colors.

---

# Spacing Tokens

Spacing must be consistent.

Example scale:

spacing.xs
spacing.sm
spacing.md
spacing.lg
spacing.xl

Avoid arbitrary spacing values.

---

# Typography Tokens

Define typography styles.

Examples:

font.heading
font.subheading
font.body
font.caption

Pages must not define custom font styles.

---

# Radius Tokens

Example:

radius.small
radius.medium
radius.large

Controls corner rounding across the UI.

---

# Shadow Tokens

Example:

shadow.sm
shadow.md
shadow.lg

Used for cards and overlays.

---

# Token Usage

Components must use tokens.

Example:

Button background → color.primary  
Card padding → spacing.md  
Modal radius → radius.large

---

# Token Benefits

Design tokens allow global visual changes.

Changing a token updates all components automatically.