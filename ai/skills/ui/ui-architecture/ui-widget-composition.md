---
name: ui-widget-composition
description: Defines how UI sections should be composed as reusable widgets or blocks that can be reused across pages.
---

# Widget Composition

User interfaces should be composed from reusable UI blocks.

These blocks may function as:

- page sections
- widgets
- embedded components

---

# Widget Characteristics

Widgets must be:

independent  
reusable  
self-contained

Widgets should not depend on page layout.

---

# Widget Structure

Typical widget structure:

WidgetContainer  
WidgetHeader  
WidgetContent  
WidgetFooter (optional)

Example:

AnalysisResultsWidget
- title
- result blocks
- summary

---

# Widget Reusability

Widgets should work in multiple contexts:

dashboard  
tool interface  
analytics page

Avoid embedding page-specific logic inside widgets.

---

# Layout Flexibility

Widgets should support different sizes and placements.

Examples:

full width  
half width  
stacked