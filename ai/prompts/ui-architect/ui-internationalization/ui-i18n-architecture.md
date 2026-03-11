---
name: ui-i18n-architecture
description: Architecture rules for building multilingual user interfaces using dictionary-based translation systems.
---

# Multilanguage UI Architecture

User interfaces must support multiple languages using a dictionary-based translation system.

Never hardcode visible UI text.

All user-visible text must come from translation dictionaries.

---

# Translation System

Use a translation function:

t("translation_key")

The function retrieves text from language dictionaries.

Example:

Correct:

t("analysis.run")

Incorrect:

"Run Analysis"

---

# Translation Dictionaries

Translations must be stored in structured dictionaries.

Example:

en.json  
ua.json  
de.json

Each dictionary contains key-value pairs.

Example:

{
  "analysis.run": "Run Analysis",
  "analysis.upload": "Upload File"
}

---

# Key Naming Convention

Use structured keys.

Preferred format:

feature.section.element

Examples:

analysis.upload_button  
analysis.run_button  
analysis.results_title  
analysis.empty_state

This prevents naming collisions.

---

# UI Integration Rules

All UI elements must use translation keys.

Examples:

Buttons  
Labels  
Titles  
Error messages  
Placeholders  
Notifications

Avoid embedding text directly in components.

---

# Language Switching

Applications should support dynamic language switching.

The UI must re-render when language changes.

Language selection may be stored in:

- local storage
- cookies
- user profile settings

---

# Translation Coverage

All languages must contain the same keys.

Missing keys should be treated as errors.

Never allow partial dictionaries.

---

# Developer Workflow

When adding new UI text:

1. create translation key
2. add the key to all dictionaries
3. reference the key using `t()`

Never create UI text without dictionary entries.

---

# Fallback Behavior

If a translation is missing:

Fallback to the default language.

Never display raw keys to the user.