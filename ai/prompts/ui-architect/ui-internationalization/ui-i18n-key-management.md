---
name: ui-i18n-key-management
description: Rules for managing translation keys in large multilingual applications and maintaining consistent dictionary structure across features and modules.
---

# Translation Key Management

As applications grow, translation dictionaries may contain hundreds or thousands of keys.

This skill defines how translation keys must be organized and managed.

---

# Key Organization

Translation keys must follow a hierarchical structure.

Preferred format:

feature.section.element

Example:

analysis.title
analysis.upload_button
analysis.run_button
analysis.results.title
analysis.results.empty_state
analysis.results.summary

This structure makes keys predictable and easy to locate.

---

# Feature-Based Grouping

Keys must be grouped by feature.

Example:

analysis.*
auth.*
dashboard.*
settings.*

This prevents dictionaries from becoming unstructured.

---

# Nested Key Structure

Dictionaries may use nested objects for clarity.

Example:

{
  "analysis": {
    "title": "Tender Analyzer",
    "upload_button": "Upload TOR",
    "run_button": "Run Analysis",
    "results": {
      "title": "Analysis Results",
      "empty_state": "No results yet"
    }
  }
}

Nested dictionaries improve readability.

---

# Key Naming Rules

Keys must be:

short  
descriptive  
consistent

Avoid:

button1  
text1  
label123

Prefer:

upload_button  
run_analysis  
results_summary

---

# Reusable Global Keys

Some UI text appears in many places.

Create shared namespaces:

common.*
actions.*
errors.*
labels.*

Examples:

actions.save
actions.cancel
actions.upload

common.loading
common.retry
common.close

errors.network
errors.validation
errors.unknown

---

# Key Lifecycle

Keys must be managed throughout the product lifecycle.

When adding new UI:

1. create new translation keys
2. add translations for all languages
3. update documentation if needed

---

# Deprecated Keys

When removing UI elements:

- mark keys as deprecated
- remove them during cleanup cycles

Do not delete keys immediately if older UI versions may still reference them.

---

# Large Dictionary Strategy

For large systems, dictionaries may be split by feature.

Example:

i18n/
  analysis.en.json
  analysis.ua.json
  auth.en.json
  auth.ua.json
  common.en.json
  common.ua.json

This prevents extremely large translation files.

---

# Translation Consistency

The same key must always represent the same meaning.

Do not reuse keys for different contexts.