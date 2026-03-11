---
name: es-event-sourcing-rules
title: Event Sourcing Rules
category: pattern
version: 0.1
description: >
  Apply Event Sourcing fundamentals consistently for write-side modeling:
  aggregates decide by replaying domain events, state is reconstructed from
  event history, and new facts are recorded as immutable domain events.
  Use for theoretical guidance before choosing concrete shared-library mechanics.
applies_to:
  - architecture
  - domain-model
  - es
  - cqrs
depends_on:
  - naming-dictionary
  - ddd-tactical-patterns
scope:
  - domain
  - architecture
owner: architecture
priority: high
---

# Event Sourcing Rules

## Mission

Codex MUST treat Event Sourcing as a modeling discipline for the write side, not merely as a persistence trick.

In an Event-Sourced system, the source of truth is the ordered history of domain events. Current aggregate state is a 
derived decision state reconstructed from those events.

Key sources:
* Eric Evans - Domain Events, Aggregates, invariants, and ubiquitous language from Domain-Driven Design.
* Martin Fowler - Event Sourcing as a pattern: complete rebuild, temporal queries, event replay, and reversal.
* Vaughn Vernon - effective aggregate design, consistency boundaries, and event-driven collaboration between aggregates.

## Terminology

* Event Sourcing (ES)
* Domain Event (Event)
* Event Stream (Stream)
* Aggregate (Aggregate)
* Aggregate Root (AR)
* Rehydration / Reconstruction
* Command
* Decision State
* Append-only History

## When to activate

Use this skill whenever the task includes any of:
* deciding whether a write-side model should be Event-Sourced
* designing an Event-Sourced aggregate
* reasoning about event history, replay, or reconstruction
* defining the difference between current state and recorded facts
* reviewing architecture for write-side ES consistency
* explaining Event Sourcing to teammates in domain terms

Do NOT use this skill as the only guidance for:
* storage adapter implementation details
* framework-specific repository mechanics
* read model or projector implementation details

Those belong to more specific skills such as shared library or CQRS read-model skills.

## Core principles

### 1. Events are the source of truth

The system of record for an Event-Sourced aggregate is the ordered sequence of domain events, not the latest mutable 
row/document snapshot.

State exists to support decisions. History exists to preserve facts.

Codex MUST model the aggregate so that current state can be derived from past domain events.

### 2. Events are facts, not commands

Domain events represent things that have happened in the business domain.
They MUST be named in past tense and in ubiquitous language.

Event names MUST always be versioned.
Codex MUST use an explicit version suffix such as:
* `OrderPlacedV1`
* `OrderPlacedV2`
* `HearingScheduledV1`

Codex MUST NOT introduce unversioned event names in an Event-Sourced model.

Good examples:
* `OrderPlacedV1`
* `CustomerRegisteredV2`
* `HearingScheduledV1`

Bad examples:
* `PlaceOrder`
* `UpdateCustomer`
* `DoRegistration`
* `OrderPlaced`

Commands express intent. Events express recorded fact.

### 3. Aggregate state is reconstructed, not loaded as arbitrary mutable data

An Event-Sourced aggregate is reconstituted by replaying its event stream in order.

Codex MUST think of aggregate state as:
* minimal
* derived
* decision-oriented

State SHOULD contain only what is required to enforce invariants and decide which new events may occur.

### 4. Aggregates remain consistency boundaries

Event Sourcing does NOT remove aggregate boundaries. Vernon's aggregate rules still apply.

Codex MUST preserve these ideas:
* one aggregate enforces one transactional consistency boundary
* strong invariants live inside one aggregate
* collaboration across aggregates uses events and eventual consistency
* aggregate size should stay small and decision-focused

### 5. History is append-only

Event streams are conceptually append-only. New facts are added. Past facts are not silently overwritten.

Corrections SHOULD usually be modeled as new compensating facts, not as mutation of previously recorded events.

### 6. Time matters

Fowler's Event Sourcing pattern highlights that a historical log enables:
* temporal understanding of how the present came to be
* replay into a new model
* rebuilding derived state
* auditability of domain decisions

Codex MUST preserve the temporal meaning of events. Do not flatten an event stream into "latest values only" thinking 
when modeling the write side.

## What Event Sourcing is for

Event Sourcing is appropriate when the domain benefits from one or more of these properties:
* the sequence of facts matters
* auditability is a domain concern
* rebuilding state from history is valuable
* domain decisions are naturally expressed as recorded facts
* collaboration between consistency boundaries is event-driven

Event Sourcing is NOT justified merely because:
* it sounds more advanced
* the team wants generic technical sophistication
* read-side querying is complicated

If the domain does not benefit from historical facts as a primary model, Event Sourcing may be unnecessary complexity.

## Aggregate model in an Event-Sourced system

An Event-Sourced aggregate receives a command, evaluates business rules against reconstructed decision state,
and produces one or more new domain events.

Codex MUST reason about aggregate behavior in this order:

1. Reconstruct aggregate state from prior events.
2. Evaluate the incoming command against current invariants.
3. Decide which new facts should happen.
4. Record those facts as new domain events.
5. Mutate decision state from those new events to reach the next decision state.

The aggregate does not store history because it "likes events". It stores history because decisions depend on the 
accumulated facts of the business.

## Invariants and decisions

Invariants remain central in Event Sourcing.

Codex MUST always ask:
* what business rule is being protected?
* what prior facts must be known to decide this command?
* does this rule belong inside this aggregate boundary?

If a rule must hold immediately and always, the required facts MUST be available inside one aggregate boundary.
If the rule can converge over time, coordination MAY happen through events between aggregates.

## Event streams and identity

Each aggregate instance has its own event stream identity.

Codex MUST preserve the idea that:
* events belong to a stream for one aggregate instance
* stream ordering matters
* aggregate identity and stream identity are tightly related

Do not model one mixed stream for unrelated consistency boundaries.

## Event design rules

Domain events MUST stay small, explicit, and domain-meaningful.

### Payload scope

Codex MUST include in an event only attributes that are:
* related to aggregate identity
* related to the business change that actually happened

Codex MUST NOT turn an event into a snapshot of the whole aggregate if most of that data did not participate in the
recorded change.

Good event payloads describe:
* which aggregate instance this fact belongs to
* which relevant values changed or were established by this fact

Bad event payloads include:
* unrelated read-model convenience fields
* duplicated aggregate state that did not change
* technical transport data with no domain meaning

### Granularity

Event design MUST balance:
* specificity of the business fact
* usefulness of the event for future reasoning and replay
* total number of event types in the model

Codex SHOULD prefer events that are concrete enough to express a meaningful business fact,
but MUST avoid fragmenting one meaningful domain change into a large number of overly narrow events
without a clear domain payoff.

Events of the form `...UpdatedV1` have the lowest priority.
Codex SHOULD introduce `...UpdatedV1`-style events only when a more specific domain fact cannot be named
confidently and the user explicitly accepts that tradeoff.

Preferred direction:
* `AddressChangedV1` over `ProfileUpdatedV1`
* `HearingRescheduledV1` over `HearingUpdatedV1`
* `EmailConfirmedV1` over `CustomerUpdatedV1`

Codex MUST treat vague update-style events as a modeling smell and first try to identify
the precise business fact that happened.

If multiple plausible event designs exist and the right level of granularity is unclear,
Codex MUST ask the user for clarification instead of guessing.

### Change origin and time

Every domain event MUST explicitly communicate:
* who caused the change
* when the change happened

Codex MUST model these concepts using explicit event attributes with the suffixes:
* `...By` for the actor or originator of the change
* `...At` for the moment when the change happened

Examples:
* `createdBy`, `registeredBy`, `scheduledBy`
* `createdAt`, `registeredAt`, `scheduledAt`

Codex MUST NOT omit change origin or change time from domain events unless the user explicitly states that the event
category is exempt from this rule.

### Attribute ordering convention

Codex MUST follow this traditional attribute order in domain events:
* aggregate identity attributes first
* business change attributes next
* `...At` attribute before last
* `...By` attribute last

If an event contains both change origin and change time, their order MUST be:
* `...At`
* `...By`

Rationale:
* time is closer to the fact itself than the actor

Example:
* `caseId`
* `previousAddress`
* `currentAddress`
* `changedAt`
* `changedBy`

### Before/after values

For change events that describe a concrete modification and are not generic `...Updated` events,
Codex MUST include explicit attributes with values from before and after the change.

Attributes with values from before the change MUST use the prefix `previous...`.
Attributes with values from after the change MUST use the prefix `current...`.

Example:
* `AddressChangedV1` MUST contain `previousAddress` and `currentAddress`

Codex SHOULD use this pattern for events such as:
* `...ChangedV1`
* `...RescheduledV1`
* `...ReplacedV1`
* `...CorrectedV1`

This rule helps preserve business meaning of the delta without turning the event into a full aggregate snapshot.

### Collection deltas

For events that describe adding or removing items in a collection, Codex MUST model collection deltas explicitly.

Such events MUST include collection attributes representing:
* the collection before the change
* the collection after the change
* the items that were added
* the items that were removed

Naming MUST use these prefixes:
* `previous...` for the collection before the change
* `current...` for the collection after the change
* `added...` for the items added by this event
* `removed...` for the items removed by this event

Examples:
* `ParticipantAddedV1`
* `ParticipantsChangedV1`
* `AttachmentRemovedV1`

For example, a collection change event MAY contain attributes such as:
* `previousParticipants`
* `currentParticipants`
* `addedParticipants`
* `removedParticipants`

Codex MUST prefer explicit collection delta attributes over vague descriptions that force the consumer
to infer what exactly changed.

## Rehydration and replay

Rehydration means rebuilding aggregate decision state from recorded events.

Codex MUST preserve these rules:
* replay order matters
* replay logic must be deterministic
* replay must not trigger side effects
* replay exists to rebuild state, not to redo external integrations

Mutating state from historical events is part of aggregate reconstruction. Publishing notifications to other systems is
a separate concern.

## Event publication vs event persistence

One of the most important conceptual distinctions:

* Persisted domain events are the aggregate's source of truth.
* Published integration messages are a delivery concern.

Codex MUST NOT collapse these two ideas into one vague "event" concept.

An event may later be published, transformed, projected, or integrated, but first it is a domain fact recorded in the 
stream of an aggregate.

## Versioning and evolution

Over time, event schemas and models evolve.

Codex SHOULD preserve these theoretical rules:
* events are part of the long-lived history of the domain
* event meaning must remain stable
* event evolution should preserve interpretability of past facts
* replay of history must remain conceptually possible

Do not design events as disposable transport DTOs with no long-term meaning.

## Relationship to CQRS

Event Sourcing and CQRS often appear together, but they are not identical.

Codex MUST distinguish:
* Event Sourcing: how the write-side source of truth is modeled and persisted
* CQRS: separation between write-side decisions and read-side query models

Read models may be rebuilt from events, but read models are not the source of write-side invariants.

## Anti-patterns

Codex MUST avoid:
* treating events as mere change logs with no domain meaning
* naming events as commands
* storing fields in aggregate state that are irrelevant to decisions
* enforcing one strong invariant across multiple aggregates in one transaction
* replay logic with side effects
* mutating or rewriting past events as a normal update strategy
* using read models as authority for aggregate decision rules
* choosing Event Sourcing for purely technical fashion rather than domain need

## Interaction rules for Codex

### Before coding

Codex MUST ask internally:
* what facts must be preserved as history?
* what invariants does this aggregate protect?
* which facts are needed to decide the next command?
* is the aggregate boundary too large?
* is a value part of decision state or only of read/query representation?

### During design or implementation

Codex MUST:
* keep events aligned with ubiquitous language
* keep aggregate state minimal and decision-oriented
* separate event persistence from event publication concerns
* explain when eventual consistency is the right cross-aggregate strategy

Codex SHOULD:
* challenge designs that use Event Sourcing without a domain payoff
* suggest smaller aggregates when replayed state grows beyond decision needs

## Minimal examples

### Correct mental model

`AccountDebited` is recorded because money was debited.
The current balance is derived from recorded facts.

### Wrong mental model

`UpdateBalance` is emitted because a service wants to change a number somewhere.

## References

Use these authors as the conceptual baseline:
* Eric Evans - Aggregates, Domain Events, invariants, and ubiquitous language
* Martin Fowler - Event Sourcing pattern and its consequences
* Vaughn Vernon - aggregate design and consistency boundaries in event-driven domains

This skill is theory-first.
Concrete shared-library mechanics belong in `shared-es-library`.
