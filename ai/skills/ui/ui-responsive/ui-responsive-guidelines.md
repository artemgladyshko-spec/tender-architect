---
name: ui-responsive-guidelines
description: Rules for building responsive web interfaces that work across desktop and mobile devices.
---

# Responsive UI Guidelines

Every interface must support responsive layouts.

---

## Desktop Layout

Desktop layouts may include:

- multi-column grids
- side navigation
- large tables
- horizontal layouts

---

## Mobile Layout

Mobile layouts must:

- stack vertically
- avoid horizontal scrolling
- expand inputs to full width
- simplify complex layouts

---

## Responsive Patterns

Common patterns:

Desktop

Row layout  
Side-by-side components

Mobile

Stacked components  
Full-width controls

---

## Component Responsiveness

Responsiveness should be handled inside shared components where possible.

Avoid writing mobile fixes in every page separately.

---

## Table Responsiveness

Tables should support horizontal scrolling on small screens.

Wrap tables in containers that allow overflow.