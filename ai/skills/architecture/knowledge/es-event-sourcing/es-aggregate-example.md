---
name: es-aggregate-example
title: Aggregate Example
category: example
version: 0.1
description: >
  Use a compact reference example of an Event-Sourced aggregate built with
  `kurrently`. Shows how commands, events, `@OnCommand`, `@OnEvent mutate(...)`,
  idempotent no-op behavior, and collection deltas fit together in one aggregate.
applies_to:
  - java
  - domain-model
  - es
  - cqrs
depends_on:
  - naming-dictionary
  - java-code-style
  - es-event-sourcing-rules
  - es-aggregate-pattern
  - shared-es-library
scope:
  - domain
  - services
owner: architecture
priority: medium
---

# Aggregate Example

## Mission

Codex SHOULD use this skill as a copyable reference when a task needs a concrete example
of an Event-Sourced aggregate built with `kurrently`.

This skill is not a source of new policy.
It demonstrates how existing rules come together in real code.

The canonical local source for this skill is the `Specimen` aggregate in:
* `fractal/guide/specimen`

## When to activate

Use this skill whenever the task includes any of:
* "show me an example aggregate"
* "how should an Event-Sourced aggregate look here?"
* creating a new aggregate and wanting a small reference
* reviewing whether an aggregate follows the expected local shape

## Canonical example

The primary example is:
* `fractal/guide/specimen/service/domain/src/main/java/fractal/guide/specimen/domain/Specimen.java`

Supporting examples:
* `fractal/guide/specimen/service/domain/src/main/java/fractal/guide/specimen/domain/command/CreateSpecimenCommand.java`
* `fractal/guide/specimen/service/domain/src/main/java/fractal/guide/specimen/domain/command/RenameSpecimenCommand.java`
* `fractal/guide/specimen/service/domain/src/main/java/fractal/guide/specimen/domain/command/AddInstrumentCommand.java`
* `fractal/guide/specimen/events/src/main/java/fractal/guide/specimen/event/SpecimenCreatedV1.java`
* `fractal/guide/specimen/events/src/main/java/fractal/guide/specimen/event/SpecimenRenamedV1.java`
* `fractal/guide/specimen/events/src/main/java/fractal/guide/specimen/event/SpecimenInstrumentAddedV1.java`

Read the compact walkthrough in:
* `references/specimen-aggregate-example.md`

## What this example demonstrates

### 1. Aggregate shape

The example shows the expected local shape:
* `@Aggregate("Specimen")`
* one `@AggregateId`
* creation handled in an `@OnCommand` constructor
* subsequent behavior handled in `@OnCommand` methods
* state transition handled in `@OnEvent mutate(...)` methods

### 2. Command design

The example commands show:
* `@AggregateId` on the command id field
* Value Object-first parameters
* explicit `...At` and `...By` attributes

### 3. Event design

The example events show:
* versioned names
* implementation of the shared `anycase.shared.events.Event` interface
* aggregate identity first
* `previous...` / `current...` for change events
* `added...` / `previous...` / `current...` for collection deltas
* `...At` before `...By`

### 4. Idempotent behavior

The example aggregate shows local no-op rules:
* rename emits no event if the name is unchanged
* add emits no event if the instrument already exists
* remove emits no event if the instrument is absent
* activate emits no event if the instrument is already activated

### 5. Mutation style

The example shows that:
* command handlers decide and record events through `Apply`
* `mutate(...)` methods update only the decision state
* not every event field must be stored in aggregate state if later decisions do not need it

## How to use this skill

When producing a new aggregate:

1. Start from the `Specimen` shape, not from an empty file.
2. Replace names with the target ubiquitous language.
3. Keep the constructor-for-create pattern unless local context clearly prefers another shape.
4. Preserve idempotent no-op behavior for commands that do not change state.
5. Preserve event payload rules from `es-event-sourcing-rules`.

## What to copy vs what to adapt

Safe to copy structurally:
* annotation placement
* constructor vs method split for `@OnCommand`
* `mutate(...)` method shape
* `Apply.event(...)` usage
* no-op early return pattern

Must be adapted:
* aggregate name
* command names
* event names
* state fields
* business invariants
* event payload semantics

## Anti-patterns

Do NOT use this example as a reason to:
* blindly copy `Specimen` names into another context
* keep fields that your aggregate does not need for decisions
* emit events for no-op commands
* move business decisions into `mutate(...)`

## References

Primary reference:
* `references/specimen-aggregate-example.md`

Source files:
* `fractal/guide/specimen/service/domain/src/main/java/fractal/guide/specimen/domain/Specimen.java`
* `fractal/guide/specimen/service/domain/src/main/java/fractal/guide/specimen/domain/command`
* `fractal/guide/specimen/events/src/main/java/fractal/guide/specimen/event`
