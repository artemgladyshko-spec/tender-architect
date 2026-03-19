---
name: es-aggregate-pattern
title: Aggregate Pattern
category: pattern
version: 0.1
description: >
  Apply the Event-Sourced Aggregate pattern consistently: an aggregate
  reconstructs decision state from its own event stream, enforces invariants,
  decides which new facts may happen, and applies those facts without side effects.
  Use for theory-first modeling of write-side aggregates before library-specific implementation.
applies_to:
  - architecture
  - domain-model
  - es
  - cqrs
depends_on:
  - naming-dictionary
  - ddd-tactical-patterns
  - es-event-sourcing-rules
scope:
  - domain
  - architecture
owner: architecture
priority: high
---

# Aggregate Pattern

## Mission

Codex MUST model an Event-Sourced aggregate as a decision-making consistency boundary.

An Event-Sourced aggregate:
* reconstructs its decision state from its own event stream
* evaluates commands against domain invariants
* decides which new domain events may happen
* applies those new events to move into the next decision state

This skill is theory-first.
It explains how an Event-Sourced aggregate should behave conceptually before any concrete shared library,
base class, repository abstraction, or framework API is chosen.

Key sources:
* Eric Evans - Aggregates as transactional consistency boundaries within the domain model.
* Martin Fowler - Event Sourcing as reconstruction of current state from historical facts.
* Vaughn Vernon - aggregate design, size control, and consistency-focused modeling.

## Terminology

* Event-Sourced Aggregate
* Aggregate Root (AR)
* Decision State
* Rehydration / Reconstruction
* Command
* Domain Event
* Invariant
* Consistency Boundary

## When to activate

Use this skill whenever the task includes any of:
* designing an Event-Sourced aggregate
* deciding what belongs inside aggregate state
* deciding how commands are handled inside an aggregate
* distinguishing between event decision and event application
* reviewing aggregate size and consistency boundaries
* explaining aggregate behavior in an Event-Sourced domain

Do NOT use this skill as the only guidance for:
* concrete event class structure
* library-specific aggregate base classes
* repository adapter implementation
* event store integration details

Those belong to library-specific or infrastructure-specific skills.

## Core idea

An Event-Sourced aggregate is not a mutable data bag.
It is a domain decision mechanism backed by event history.

Codex MUST think about the aggregate in this order:

1. Reconstruct decision state from prior events.
2. Receive a command or domain intention.
3. Check invariants and business rules.
4. Decide which new facts should be recorded.
5. Mutate aggregate state from those new facts to reach the next state.

The aggregate exists to protect invariants and emit correct facts.
It does not exist to mirror every attribute of a read model.

## Aggregate responsibilities

An Event-Sourced aggregate MUST:
* define one transactional consistency boundary
* own one event stream per aggregate instance
* protect invariants that must hold immediately
* expose intention-revealing behavior
* produce domain events as facts
* mutate state deterministically from events

An Event-Sourced aggregate MUST NOT:
* act as a DTO or persistence snapshot
* depend on read models to enforce write-side invariants
* span multiple independent consistency boundaries
* perform side effects during replay
* expose unrestricted setters or mutable internals

## Decision state

Aggregate state in an Event-Sourced system is decision state.

Codex MUST include in aggregate state only information needed to:
* evaluate current commands
* enforce invariants
* decide the next valid domain events

If a value does not influence a decision, invariant, or transition,
it probably does not belong inside the aggregate.

This usually means aggregate state SHOULD be smaller than query/read models.

## Rehydration

Rehydration reconstructs aggregate decision state from the ordered event stream of that aggregate instance.

Codex MUST preserve these rules:
* replay order matters
* replay must be deterministic
* replay must rebuild state only
* replay must not call external systems
* replay must not publish new events

Historical replay and operational side effects are different concerns.

## Decide vs mutate

Codex MUST clearly separate:
* deciding new events
* mutating state from events

### Decide

Decision logic:
* evaluates commands or intentions
* checks invariants
* determines whether the requested change is allowed
* emits one or more new domain events

### Mutate

Mutate logic:
* mutates aggregate state from an event
* is deterministic
* does not perform business negotiation
* does not call external dependencies

Simple rule:
* decide because of commands
* mutate because of events

Codex MUST NOT hide invariant checks inside replay-only state mutation logic when the real domain decision
belongs in command handling.

If the implementation uses the term `apply`, Codex MUST treat it as an internal operation that adds a newly decided
event and immediately causes the corresponding mutation.
The conceptual state transition rule in this codebase is still expressed as `mutate`.

## Aggregate creation

Creation of a new aggregate instance in an Event-Sourced system also happens through events.

Codex SHOULD model aggregate creation as:
* receiving a creation command or intention
* deciding that creation is valid
* emitting an initial event
* mutating state from that event to initialize aggregate state

The initial event establishes the first known fact of the aggregate lifecycle.

## Aggregate boundaries

Event Sourcing does NOT justify larger aggregates.

Codex MUST still prefer small aggregates centered on strong consistency rules.

If a rule requires immediate consistency, it belongs inside one aggregate.
If coordination can happen over time, it SHOULD happen through events between aggregates.

Vernon's guidance remains valid:
* do not model aggregates around object graphs
* do not pull unrelated data into one root for convenience
* do not expand aggregate state merely to avoid eventual consistency

## References to other aggregates

An Event-Sourced aggregate SHOULD refer to other aggregates by identity, not by deep mutable references.

Codex MUST avoid designs where one aggregate directly manipulates internals of another aggregate.

Cross-aggregate coordination SHOULD happen through:
* identities
* policies
* domain events
* eventual consistency

## Event count per decision

One accepted command may produce:
* one event
* multiple events
* no event if nothing valid happened

Codex SHOULD choose the smallest set of events that truthfully represents the business outcome.

Do not force "exactly one event per command" as a universal rule.
Do not emit technical filler events merely to satisfy a pattern.

## Idempotency

Command handling in an Event-Sourced aggregate SHOULD be idempotent with respect to state change.

If a command does not produce any real domain change, Codex MUST NOT emit a new event merely to acknowledge
that nothing changed.

Simple rule:
* no state change -> no new event

Codex SHOULD interpret repeated commands carefully:
* if the command repeats a state that is already true, prefer no-op behavior with no new event
* if the repeated command represents a new business fact, emit a new event only when the domain meaning truly differs

Do not use events to record technical retries or duplicate intentions when no new domain fact occurred.

## Invariants

Codex MUST ask for every aggregate:
* which rule must hold immediately?
* which facts are needed to evaluate that rule?
* does that rule really belong inside this aggregate?

Strong invariants belong inside one aggregate boundary.
Weakly coupled follow-up actions belong in eventually consistent reactions.

## Anti-patterns

Codex MUST avoid:
* aggregates that only store data and expose setters
* aggregates containing large amounts of query-only state
* replay code with side effects
* using read models to validate commands
* cross-aggregate transactions disguised as one aggregate operation
* putting orchestration workflow logic inside one aggregate root
* mixing event publication concerns into pure aggregate decision logic

## Interaction rules for Codex

### Before coding

Codex MUST ask internally:
* what invariant does this aggregate protect?
* what is the minimum state needed to protect it?
* what event stream belongs to this aggregate instance?
* what is command decision logic and what is pure mutate logic?
* is this actually one aggregate or several consistency boundaries?

### During design or implementation

Codex MUST:
* keep aggregate behavior intention-revealing
* keep state minimal and decision-oriented
* separate decision from mutate logic
* separate replay from side effects
* challenge designs that grow the aggregate for query convenience

Codex SHOULD:
* suggest splitting aggregates when invariants are unrelated
* suggest eventual consistency when cross-aggregate rules do not need atomicity

## Minimal examples

### Correct mental model

`Case` is reconstructed from prior events, receives `changeAddress(...)`,
checks whether address change is allowed, emits `AddressChangedV1`,
then mutates decision state from that event.

### Wrong mental model

`Case` loads a big mutable object snapshot, updates fields directly,
and later emits some generic event because the data changed.

## References

Use these authors as the conceptual baseline:
* Eric Evans - Aggregates and invariants
* Martin Fowler - Event Sourcing and replay
* Vaughn Vernon - effective aggregate design and consistency boundaries

This skill focuses on aggregate behavior.
General event design belongs in `es-event-sourcing-rules`.
Concrete implementation mechanics belong in `shared-es-library`.
