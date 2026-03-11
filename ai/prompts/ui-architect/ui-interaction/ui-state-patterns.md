---
name: ui-state-patterns
description: Defines UI states such as loading, empty, processing, and error states.
---

# UI State Patterns

Interfaces must clearly communicate system state to the user.

Every feature should support key UI states.

---

# Loading State

Indicates that data is being retrieved or processed.

Examples:

spinner  
progress indicator  
skeleton loader

---

# Empty State

Displayed when no data exists.

Example:

"No results yet."

Empty states should guide the user on what to do next.

---

# Processing State

Used when an action is running.

Example:

Run Analysis → "Analyzing document..."

Buttons should show loading indicators.

---

# Error State

Displayed when something fails.

Examples:

Network error  
Validation error  
Processing failure

Error messages must be clear and actionable.

---

# Success State

Indicates successful completion.

Examples:

"Analysis completed."

Results should be presented immediately.