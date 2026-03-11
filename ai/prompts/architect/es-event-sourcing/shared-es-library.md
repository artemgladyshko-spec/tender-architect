---
name: shared-es-library
title: Shared ES Library
category: shared-kernel
version: 0.1
description: >
  Use the shared Event Sourcing library `kurrently` correctly when implementing
  aggregates, command dispatch, reconstruction, mutation flow, event persistence,
  and aggregate tests. Prefer the shared ES abstractions and conventions instead
  of ad hoc local implementations.
applies_to:
  - java
  - domain-model
  - es
  - cqrs
depends_on:
  - naming-dictionary
  - java-code-style
  - ddd-tactical-patterns
  - ddd-value-objects-policy
  - es-event-sourcing-rules
  - es-aggregate-pattern
scope:
  - domain
  - services
owner: platform
priority: high
---

# Shared ES Library

## Mission

Codex MUST use the shared Event Sourcing library `kurrently` as the default implementation toolkit
for aggregates, command dispatch, reconstruction flow, state mutation, event persistence, and aggregate testing.

This skill is implementation-specific.
It does not define architectural policy by itself.
Architectural intent is defined in higher-level skills such as:
* `ddd-tactical-patterns`
* `es-event-sourcing-rules`
* `es-aggregate-pattern`
* `ddd-value-objects-policy`

This skill operationalizes those policies using the shared Event Sourcing library located in:
* `anycase/global-shared/kurrently`

## When to activate

Use this skill whenever the task includes any of:
* implementing or refactoring an aggregate that uses `kurrently`
* adding or reviewing `@Aggregate`, `@AggregateId`, `@OnCommand`, or `@OnEvent`
* using `Apply.event(...)` or `Apply.events(...)`
* reasoning about aggregate reconstruction from event history
* implementing or reviewing command dispatch through `CommandBus`
* implementing or reviewing event persistence through the shared `EventStore`
* writing aggregate tests with `AggregateTest`
* replacing local ES infrastructure patterns with `kurrently` abstractions

## Core rule

Codex MUST prefer `kurrently` over local custom Event Sourcing infrastructure whenever the library
already provides the needed abstraction or lifecycle.

Codex MUST NOT invent:
* parallel aggregate lifecycle frameworks
* custom replay/reconstruction orchestration
* local alternatives to `@OnCommand` / `@OnEvent`
* ad hoc in-aggregate event collectors instead of `Apply`
* local testing DSLs for aggregate behavior when `AggregateTest` is sufficient
* local event publishing metadata logic that conflicts with `kurrently`

Unless explicitly requested, `kurrently` is the default source of truth for write-side
Event Sourcing implementation mechanics in this codebase.

## Scope of this skill

This skill governs how to use:
* aggregate annotations and design constraints
* command handler registration rules
* event mutator registration rules
* `Apply.event(...)` and `Apply.events(...)`
* aggregate reconstruction conventions
* event persistence and metadata preparation flow
* command dispatch through `CommandBus`
* aggregate tests through `AggregateTest`
* naming and structural conventions imposed by `kurrently`

This skill does NOT define:
* bounded contexts
* aggregate boundaries
* business invariants
* read model structure
* projector implementation details outside the aggregate write side

## Decision order

When implementing or refactoring event-sourced write-side code, Codex MUST follow this order:

1. Check whether the aggregate should be implemented with `kurrently` annotations and `CommandBus`.
2. Model the aggregate around `@OnCommand` handlers and `@OnEvent` mutators.
3. Use `Apply.event(...)` or `Apply.events(...)` to record new facts inside command handling.
4. Let `kurrently` reconstruct aggregate state from past events and persist resulting events.
5. Use `AggregateTest` for aggregate-level tests instead of ad hoc command/mutator wiring.
6. Keep names aligned with ubiquitous language and higher-level ES/DDD skills.

## Mandatory rules

### 1. Use `@Aggregate` as the aggregate entry point

Every `kurrently` aggregate MUST be a class annotated with `@Aggregate`.

The annotation value defines the aggregate type used by the library.

Codex MUST NOT create parallel aggregate-registration mechanisms.

### 2. Exactly one `@AggregateId`

Every `kurrently` aggregate MUST have exactly one field annotated with `@AggregateId`.

The same rule applies to commands handled by the aggregate: command identity is extracted through
the command field marked with `@AggregateId`.

Codex MUST NOT:
* omit `@AggregateId`
* declare multiple `@AggregateId` fields
* mutate aggregate identity after it has been established

The first domain event MUST initialize aggregate identity in the corresponding `@OnEvent` mutator.

### 3. `@OnCommand` handles decisions

Use `@OnCommand` on:
* an aggregate constructor for creation commands
* aggregate methods for commands against an existing aggregate

Each `@OnCommand` handler MUST accept exactly one command parameter.
For a given aggregate, there MUST be only one `@OnCommand` handler per command type.

`@OnCommand` handlers MUST:
* evaluate business rules
* decide whether new domain events should be created
* call `Apply.event(...)` or `Apply.events(...)` for accepted facts

`@OnCommand` handlers MUST NOT:
* mutate aggregate state directly as the primary state transition mechanism
* publish events manually
* persist events manually

### 4. `@OnEvent` mutates state

Use `@OnEvent` only on methods that mutate aggregate state from one event.

Each `@OnEvent` mutator MUST accept exactly one event parameter.
For a given aggregate, there MUST be only one `@OnEvent` mutator per event type.

`@OnEvent` methods MUST:
* mutate aggregate state deterministically
* initialize aggregate identity from the first creation event
* remain side-effect free

`@OnEvent` methods MUST NOT:
* make domain decisions
* call external services
* publish new events
* change aggregate identity after it has been initialized

### 5. Use `Apply` to record events inside command handling

Inside a command handler, new business facts MUST be recorded through:
* `Apply.event(event)`
* `Apply.events(event1, event2, ...)`

In `kurrently`, `Apply` records the event in the current aggregate context, and the framework
later mutates aggregate state and persists the event.

Codex MUST NOT create local event collector fields or alternative recording mechanisms inside aggregates.

### 6. Events implement the shared `Event` contract

All domain events used with `kurrently` MUST implement:
* `anycase.shared.events.Event`

Each such event MUST provide:
* `eventBusinessKey()`

For aggregate domain events, `eventBusinessKey()` SHOULD return the business key of the aggregate instance,
which is typically the aggregate id converted to string, for example:
* `id().value()`

Codex MUST NOT introduce parallel domain event interfaces for normal aggregate events when the shared `Event`
contract is the intended codebase standard.

### 7. Follow the library lifecycle

The `kurrently` lifecycle is:

1. `CommandBus` resolves the aggregate and command handler.
2. The framework creates a fresh aggregate instance.
3. The framework restores aggregate state by replaying past events from `EventStore`.
4. The `@OnCommand` handler records new events through `Apply`.
5. The framework mutates aggregate state from those recorded events.
6. The framework persists events through `EventStore`.

Codex MUST align implementations with this lifecycle.

Codex MUST NOT manually replay events, manually call mutators, or bypass `CommandBus`
when implementing production aggregate flow.

### 8. Let the library prepare publishing metadata

`kurrently` prepares strict event publishing metadata from:
* aggregate type
* aggregate id
* generation / stream state
* service name
* tracing context such as correlation and contributor ids

Codex SHOULD rely on the shared metadata preparation flow instead of constructing event publishing
metadata by hand inside aggregates.

## Library usage patterns

### Aggregate shape

Preferred shape:
* `@Aggregate("SomeAggregate")`
* one `@AggregateId` field
* private no-args constructor for rehydration
* `@OnCommand` constructor for create command
* `@OnCommand` methods for commands against existing aggregate
* `@OnEvent` mutator methods for state transitions

### Aggregate identifiers

Aggregate identity MUST be stable.

Codex MUST ensure:
* the first creation event initializes the `@AggregateId` field
* later events do not change the id
* command id and aggregate id refer to the same aggregate instance

### Command handling

Creation commands SHOULD be handled in an `@OnCommand` constructor when the aggregate is born
from the first event.

Subsequent commands SHOULD be handled in `@OnCommand` methods such as `execute(...)`,
`change(...)`, `delete(...)`, or other ubiquitous-language operations.

The exact method name is domain-driven, but the handler contract is always `@OnCommand`.

### Event classes

Domain event classes used by aggregates MUST:
* implement `anycase.shared.events.Event`
* provide `eventBusinessKey()`
* follow naming and payload rules from `es-event-sourcing-rules`

For aggregate events, `eventBusinessKey()` SHOULD normally return the aggregate id value.

### Mutation

Use method name `mutate(...)` for `@OnEvent` handlers unless surrounding code establishes
another consistent convention.

Mutation methods SHOULD be small and focused on assigning next decision state from event data.

If the aggregate intentionally does not need some event field for future decisions, it MAY omit
storing that field in state.

### Reconstruction

Aggregate reconstruction is automatic.

Codex MUST assume:
* a fresh aggregate instance is created for command execution
* event history is read from the event store
* every event is replayed through the matching `@OnEvent` mutator

Do not write explicit reconstruction loops in application code if `kurrently` already performs them.

### Deletion and restoration

The library supports deletion/restore marker events internally through `Apply.deletionMark()`
and `Apply.restoreDeleted()`.

Codex SHOULD treat these as infrastructure-level lifecycle helpers, not as a substitute for
business domain events unless the use case explicitly requires them.

### Aggregate testing

Use `AggregateTest` for aggregate behavior tests.

Preferred style:
* `AggregateTest.forType(Aggregate.class)`
* `.withDefaultContext()`
* optional `.given(event...)`
* `.when(command)`
* `.expectEvent(event)` or `.expectEvents(events...)`

Aggregate tests SHOULD verify produced business events, not internal library marker events.

`AggregateTest` runs through the real command dispatch and reconstruction flow using the shared test utilities.
Codex SHOULD prefer it over tests that call command handlers or mutators directly.

## Workflow checklist

When applying this skill, Codex SHOULD verify:

1. The aggregate is annotated with `@Aggregate` and has exactly one `@AggregateId`.
2. Each command type has at most one `@OnCommand` handler in the aggregate.
3. Each event type has at most one `@OnEvent` mutator in the aggregate.
4. `@OnCommand` handlers use `Apply.event(...)` / `Apply.events(...)` instead of direct state mutation.
5. Domain events implement `anycase.shared.events.Event` and provide `eventBusinessKey()`.
6. The first creation event initializes aggregate identity in the mutator.
7. Reconstruction and persistence are delegated to `kurrently`, not reimplemented locally.
8. Aggregate tests use `AggregateTest` and assert business events only.

## Naming conventions

The following conventions are implied by current `kurrently` usage:

* aggregate class name SHOULD match the conceptual aggregate
* `@Aggregate("...")` value SHOULD be the canonical aggregate type name
* aggregate id field SHOULD use the domain id name and carry `@AggregateId`
* command handlers MAY use constructor for create and methods for other commands
* `@OnEvent` methods SHOULD be named `mutate`
* event class naming and versioning MUST follow `es-event-sourcing-rules`
* aggregate event classes SHOULD return aggregate id from `eventBusinessKey()`

## Anti-patterns

Codex MUST avoid:
* aggregates without `@AggregateId`
* multiple command handlers for the same command type on one aggregate
* multiple mutators for the same event type on one aggregate
* direct state mutation in `@OnCommand` without recording an event
* event recording through custom local collections instead of `Apply`
* domain events that do not implement `anycase.shared.events.Event`
* aggregate events with missing or incorrect `eventBusinessKey()`
* changing aggregate id in a later mutator
* command tests that bypass `AggregateTest` without a strong reason
* manual replay/persist orchestration in application code when `kurrently` already does it
* mixing query-only state into aggregate state just because it exists on a read model

## References

Primary local sources for this skill:
* `anycase/global-shared/kurrently/README.md`
* `anycase/global-shared/kurrently/core/src/main/java/anycase/shared/kurrently`
* `anycase/global-shared/kurrently/tests/src/main/java/anycase/shared/kurrently`
* `anycase/global-shared/kurrently/tests/src/test/java/anycase/shared/kurrently`
