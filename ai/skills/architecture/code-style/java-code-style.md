---
name: java-code-style
title: Java Code Style
category: style
version: 0.1
description: Enforce Java coding style during code authoring and code review. Use this skill whenever the task includes Java files or Java changes, especially for prompts like "implement class/classes", "implement code", "refactor class/classes", "review code", and "review implementation".
applies_to:
  - java
depends_on:
  - naming-dictionary
scope:
  - workspace
owner: platform
priority: high
---

# Java Code Style

This skill is mandatory whenever `.java` files are added, modified, or reviewed.

## Activation

Activate when:
- Any `.java` file changes.
- A diff contains Java code.
- The prompt mentions Java implementation or review.
- This skill also governs Lombok usage.

Additionally, this skill MUST apply the `naming-dictionary` skill whenever:
- creating new classes, methods, fields, commands, events, enums
- renaming any identifier
- reviewing naming in Java code

## Style Source Priority

1. CODESTYLE.md (project-level)
2. JAVA_CODESTYLE.md (skill-level)
3. Existing surrounding file style

## Workflow

1. Detect Java scope.
2. Load style sources in priority order.
3. Apply naming semantics.
	- Enforce naming dictionary.
	- Validate verb semantics (Create/Delete, Add/Remove, Change/Modify, etc.).
	- Avoid generic verbs such as `Update` unless explicitly justified.
4. Apply style during generation or review.
5. Verify compliance before final output.

## Hard Fail Conditions

The result is invalid if:
- Spaces are used for indentation.
- More than one blank line appears consecutively.
- `var` is used.
- Local variables are not `final` unless mutation is required.
- Naming violates naming dictionary without explicit justification.

## Review Output Rules

- Separate style findings from functional findings.
- Reference exact files and lines.
- Propose minimal, style-consistent fixes.
- Naming violations must reference the dictionary rule being broken.

## Implementation Output Rules

- Output style-compliant code directly.
- Do not output code that violates style.
- Inspect neighboring files if style is ambiguous.

## Exception Policy

Some rules (e.g., `final` local variables, `final`/`abstract` class requirement, class naming) may require exceptions in rare cases.

An exception is allowed only if:

- The deviation is explicitly requested in the prompt, OR
- There is a clear technical constraint (e.g., framework requirement, proxy generation, serialization, testing need).

In such cases:

- Clearly state which rule is being violated.
- Explain why the violation is necessary.
- Limit the violation strictly to the required scope.
- Do not generalize the exception.

If no explicit justification exists, treat rule violations as invalid.

Naming exceptions must reference the `naming-dictionary` rule being overridden.

## Verification

- Run compile/tests/lint when possible.
- If verification cannot run, explicitly state that.
