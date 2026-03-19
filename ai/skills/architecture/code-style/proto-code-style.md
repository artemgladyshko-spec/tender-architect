---
name: proto-code-style
title: Protobuf Code Style
category: style
version: 0.1
description: Enforce Mascode Protobuf API and coding style during authoring and review. Mandatory whenever `.proto` files are added, modified, or reviewed.
applies_to:
  - proto
depends_on:
  - naming-dictionary
scope:
  - code-style
owner: platform
priority: high
---

# Proto Code Style

Apply consistent Protobuf API rules for naming, versioning, meta-options, evolution/compatibility, and review output.

This skill MUST also apply the `naming-dictionary` skill whenever creating or renaming:
- services
- RPC methods
- messages
- fields
- enums / enum values

## Workflow

1. Identify changed `.proto` files and affected packages/services/messages.
2. Read and apply `PROTO_RULES.md`.
3. Apply naming semantics via `naming-dictionary`:
	- Validate verb semantics (Create/Delete, Add/Remove, Find/Get, List/Search, etc.).
	- Avoid generic verbs such as `Update` unless explicitly justified.
4. Validate naming, structure, and versioning for files, packages, services, RPCs, messages, fields, enums.
5. Validate mandatory meta-options for service/message/field, including formatting rules.
6. Validate compatibility rules for field numbers, reserved entries, enum evolution, and message evolution.
7. If reviewing, produce findings ordered by severity with exact `path:line`.
8. If implementing/refactoring, apply only safe evolution changes by default.
	- Breaking changes require explicit approval in the prompt.

## Hard Fail Conditions

The result is invalid if it introduces or causes:
- Changing field numbers of existing fields.
- Reusing deleted field numbers or names without reserving them.
- Removing a field without reserving its number and name.
- Renumbering enum values, or reusing enum numeric values for different semantics.
- Introducing RPC/service/message/field without mandatory meta-options.
- Missing version suffix where required (service/message/file naming).
- Naming that violates `naming-dictionary` without explicit justification.
- Indentation uses spaces instead of TAB.

## Review Output Contract

When reviewing `.proto` changes, always output:
1. Findings first, ordered by severity, each with `path:line`.
2. Compatibility risks explicitly labeled.
3. Suggested corrected naming/shape for each finding.
4. Brief summary and residual risks only after findings.

## Exception Policy

Some rules may require exceptions in rare cases (legacy/public API, compatibility constraints).

An exception is allowed only if:
- explicitly requested in the prompt, OR
- required by backward compatibility/public API constraints.

In such cases:
- explicitly state which rule is violated
- explain why it is necessary
- limit it to the smallest scope
- do not generalize the exception

Silent exceptions are invalid.

## Resources

Use `PROTO_RULES.md` for full naming, versioning, meta-options, compatibility, and review checklist details.
