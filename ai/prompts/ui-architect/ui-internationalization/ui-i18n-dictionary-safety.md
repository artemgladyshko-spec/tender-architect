---
name: ui-i18n-dictionary-safety
description: Safety rules for editing translation dictionaries and preventing corruption, overwrites, and encoding errors.
---

# Translation Dictionary Safety

Translation dictionaries are sensitive files.

They must be edited carefully to prevent corruption or loss of translations.

---

# Do Not Rewrite Entire Dictionaries

Never regenerate or rewrite full translation files.

Only add or modify specific keys.

Large rewrites may delete translations unintentionally.

---

# Do Not Reorder Keys

Keep the existing order of keys.

Reordering creates unnecessary merge conflicts and version control noise.

---

# Encoding Rules

Translation files must use UTF-8 encoding.

Never convert files to legacy encodings such as:

Windows-1251  
ISO-8859

Incorrect encoding produces corrupted text.

Example corruption:

РџРРЅРµР  
Ð¢ÐµÐºÑ

If corrupted characters appear, stop editing and fix encoding.

---

# Language Parity

All dictionaries must contain the same keys.

Example:

en.json

analysis.run  
analysis.upload  
analysis.results

ua.json must contain exactly the same keys.

---

# Safe Dictionary Editing

When adding new text:

1. append new key
2. add translation for each language
3. verify file encoding
4. verify syntax

Example:

Add to all dictionaries:

analysis.run_button

---

# Prevent Duplicate Keys

Never duplicate keys with different meanings.

If a new meaning is needed, create a new key.

Example:

analysis.run_button  
analysis.retry_button

---

# Validation

After editing dictionaries verify:

- no syntax errors
- no missing commas
- valid JSON structure
- no duplicate keys

Invalid dictionary files may break the application.

---

# Automation Recommendation

Use validation scripts or CI checks to detect:

- missing keys
- duplicate keys
- invalid JSON
- encoding problems