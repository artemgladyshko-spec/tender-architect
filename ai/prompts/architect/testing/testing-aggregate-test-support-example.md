---
name: testing-aggregate-test-support-example
title: Aggregate Test Support Example
category: example
version: 0.1
description: >
  Use a compact reference example of aggregate tests built with `AggregateTest`.
  Shows how to test an Event-Sourced aggregate using `given -> when -> expectEvent(s)`
  with real command dispatch and replay semantics.
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
priority: medium
---

# Aggregate Test Support Example

## Mission

Codex SHOULD use this skill as a copyable reference when writing aggregate tests for `kurrently` aggregates.

This skill combines:
* the real `AggregateTest` DSL from `anycase/global-shared/kurrently`
* the real aggregate shape from `fractal/guide/specimen`

It is example-first, not policy-first.

## When to activate

Use this skill whenever the task includes any of:
* "show me how to test an aggregate here"
* writing tests for a `kurrently` aggregate
* converting hand-written aggregate tests to `AggregateTest`
* reviewing whether an aggregate test matches the local DSL

## Canonical sources

Testing DSL source:
* `anycase/global-shared/kurrently/tests/src/main/java/anycase/shared/kurrently`
* `anycase/global-shared/kurrently/tests/src/test/java/anycase/shared/kurrently`

Aggregate under test source:
* `fractal/guide/specimen/service/domain/src/main/java/fractal/guide/specimen/domain/Specimen.java`
* `fractal/guide/specimen/service/domain/src/main/java/fractal/guide/specimen/domain/command`
* `fractal/guide/specimen/events/src/main/java/fractal/guide/specimen/event`

Read the compact walkthrough in:
* `references/specimen-aggregate-test-example.md`

## Core testing shape

Preferred aggregate test shape:

```java
AggregateTest
	.forType(SomeAggregate.class)
	.withDefaultContext()
	.given(/* optional prior events */)
	.when(/* command */)
	.expectEvent(/* expected event */);
```

or:

```java
AggregateTest
	.forType(SomeAggregate.class)
	.withDefaultContext()
	.given(/* optional prior events */)
	.when(/* command */)
	.expectEvents(/* expected events */);
```

## What this example demonstrates

### 1. Tests drive the real aggregate flow

`AggregateTest` runs through:
* command dispatch
* aggregate reconstruction from given events
* command handling
* event recording

Codex SHOULD prefer this over tests that call `@OnCommand` or `mutate(...)` directly.

### 2. `given(...)` uses business events

Historical setup SHOULD use real domain events, not hand-mutated aggregate state.

### 3. Assertions target business events

Expected results SHOULD be business events only.
Do not assert internal marker events unless the test is explicitly about that infrastructure behavior.

### 4. No-op behavior is test-worthy

If a command should not emit an event when nothing changes, write a test that expects no business events.

### 5. Collection changes should assert delta events

When a command changes a collection, expected events SHOULD assert the precise collection delta payload,
not just a vague "updated" fact.

## How to use this skill

When writing a new aggregate test:

1. Start from the examples in `references/specimen-aggregate-test-example.md`.
2. Use `.given(...)` only for history required to make the command meaningful.
3. Keep one business behavior per test.
4. Assert the exact expected event or ordered sequence of events.
5. Prefer descriptive test names around the business outcome.

## Anti-patterns

Do NOT:
* instantiate the aggregate and call `mutate(...)` manually as the main testing style
* set private fields directly in tests
* use read models instead of events in `given(...)`
* assert generic success instead of exact events
* skip no-op tests for idempotent commands

## References

Primary reference:
* `references/specimen-aggregate-test-example.md`

Source files:
* `anycase/global-shared/kurrently/tests/src/main/java/anycase/shared/kurrently`
* `anycase/global-shared/kurrently/tests/src/test/java/anycase/shared/kurrently`
* `fractal/guide/specimen/service/domain/src/main/java/fractal/guide/specimen/domain/Specimen.java`
