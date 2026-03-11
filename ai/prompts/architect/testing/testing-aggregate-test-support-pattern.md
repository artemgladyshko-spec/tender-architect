---
name: testing-aggregate-test-support-pattern
title: Aggregate Test Support Pattern
category: pattern
version: 0.1
description: >
  Apply consistent aggregate testing rules for `kurrently` aggregates.
  Use `AggregateTest` as the default aggregate test harness, set up history
  with domain events, execute one command per test, and assert exact business
  events including no-op outcomes.
applies_to:
  - java
  - testing
  - es
  - cqrs
depends_on:
  - naming-dictionary
  - java-code-style
  - es-aggregate-pattern
  - shared-es-library
scope:
  - testing
  - domain
owner: architecture
priority: high
---

# Aggregate Test Support Pattern

## Mission

Codex MUST treat aggregate tests as behavior tests for the write side.

For `kurrently` aggregates, the default aggregate test harness is `AggregateTest`.
Aggregate tests MUST verify the business facts emitted by a command against reconstructed history.

This skill defines the testing pattern.
Concrete snippets and example flows belong in `testing-aggregate-test-support-example`.

## When to activate

Use this skill whenever the task includes any of:
* writing tests for a `kurrently` aggregate
* reviewing aggregate tests
* converting direct aggregate unit tests to the shared aggregate DSL
* deciding what an aggregate test should assert

## Core rule

Codex MUST prefer `AggregateTest` over ad hoc aggregate test wiring whenever the goal is to test
aggregate behavior.

Codex MUST NOT default to:
* direct field mutation in tests
* manual calls to `mutate(...)` as the main test style
* testing aggregate behavior through read models
* treating aggregate tests as generic service tests

## Canonical shape

The default aggregate test shape is:

1. `AggregateTest.forType(Aggregate.class)`
2. `.withDefaultContext()`
3. optional `.given(history...)`
4. `.when(command)`
5. `.expectEvent(...)` or `.expectEvents(...)`

One test SHOULD verify one business behavior.

## Mandatory rules

### 1. History is set up with events

Previous aggregate state MUST be expressed through domain events in `.given(...)`.

Codex MUST NOT initialize aggregate state in tests by:
* setting fields directly
* calling mutators directly
* bypassing event history

### 2. Execution is one command

The `when(...)` step MUST execute one command.

If a scenario needs multiple commands, split it into multiple tests unless the user explicitly needs
an end-to-end sequence inside one aggregate test.

### 3. Assertions target business events

Aggregate tests MUST assert emitted business events.

Preferred assertions:
* `.expectEvent(event)`
* `.expectEvents(event1, event2, ...)`

Do not assert vague success conditions when the emitted event can be asserted precisely.

### 4. No-op behavior is part of the contract

If a command does not produce a real domain change, the aggregate test SHOULD assert no business events.

This is especially important for idempotent commands and guard clauses.

### 5. Event order matters

When a command emits multiple events, aggregate tests MUST assert the exact order of those events.

Codex MUST treat event order as part of the observable aggregate behavior.

### 6. Test domain facts, not infrastructure noise

Aggregate tests SHOULD ignore internal marker events unless the test is explicitly about library lifecycle behavior.

The normal focus is:
* command intent
* prior business facts
* resulting business facts

### 7. Use real domain types

Commands and expected events in aggregate tests SHOULD use the same domain Value Objects and event classes
as production code.

Do not flatten aggregate tests into raw primitives just to make them shorter.

## What aggregate tests are for

Aggregate tests are best suited for verifying:
* command acceptance and rejection by behavior
* emitted domain events
* idempotent no-op behavior
* event sequences
* decisions based on replayed history

Aggregate tests are not the main place for verifying:
* transport adapters
* persistence integration
* read model projections
* framework configuration

## Review checklist

When reviewing an aggregate test, Codex SHOULD check:

1. Does the test use `AggregateTest`?
2. Does `.given(...)` describe history through domain events?
3. Does `.when(...)` execute exactly one command?
4. Does the assertion verify exact business events?
5. Is there a missing no-op test for a guard or idempotent path?
6. If multiple events are expected, is their order asserted?

## Anti-patterns

Codex MUST avoid:
* calling `mutate(...)` directly as the primary aggregate test style
* creating aggregate state by assigning private fields
* using read models in place of prior events
* asserting booleans or generic success instead of exact events
* skipping tests for no-op/idempotent command paths
* mixing adapter behavior into aggregate behavior tests

## References

Primary local sources:
* `anycase/global-shared/kurrently/tests/src/main/java/anycase/shared/kurrently`
* `anycase/global-shared/kurrently/tests/src/test/java/anycase/shared/kurrently`

Companion example skill:
* `testing-aggregate-test-support-example`
