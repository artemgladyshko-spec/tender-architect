---
name: ui-skill-load-order
description: Defines the recommended load order for UI skills to ensure consistent architecture, design system usage, responsive behavior, state handling, and internationalization.
---

# UI Skill Load Order

UI generation should follow a predictable skill loading order.

Each skill group builds on the previous one.

Incorrect ordering may cause inconsistent UI structure or styling.

---

# Skill Loading Principles

Skills must be applied in the following conceptual order:

1. Architecture
2. Component structure
3. Design system
4. Design tokens
5. Visual design rules
6. Responsive behavior
7. Page composition
8. Widget composition
9. UI states
10. User feedback
11. Data display patterns
12. Internationalization

This ensures UI is generated with a stable structure.

---

# Recommended Skill Order

## Architecture Layer

ui-architecture-principles  
ui-component-architecture  

---

## Design System Layer

ui-design-system-architecture  
ui-design-tokens  
ui-component-variants  

---

## Visual Design Layer

ui-design-guidelines  

---

## Responsive Layer

ui-responsive-guidelines  

---

## Page Composition Layer

ui-task-oriented-pages  
ui-widget-composition  

---

## Interaction Layer

ui-state-patterns  
ui-user-feedback-patterns  

---

## Data Display Layer

ui-data-display-patterns  

---

## Internationalization Layer

ui-i18n-architecture  
ui-i18n-key-management  
ui-i18n-dictionary-safety  

---

# Execution Strategy

When generating UI:

1. establish page architecture
2. compose UI from reusable components
3. enforce design system components
4. apply global design tokens
5. apply visual design rules
6. ensure responsive layout
7. implement UI states
8. implement feedback patterns
9. implement data display patterns
10. apply multilingual text via translation keys