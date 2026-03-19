---
name: ddd-tactical-patterns
title: DDD Tactical Patterns
category: pattern
version: 0.1
description: >
  Apply DDD tactical patterns consistently: Entities, Value Objects, Aggregates,
  Domain Services, Repositories, Factories, Domain Events, invariants, and
  ubiquitous language rules. Use for write-side domain modeling and refactoring.
applies_to:
  - architecture
  - domain-model
depends_on:
  - naming-dictionary
scope:
  - domain
  - architecture
owner: architecture
priority: high
---

# DDD Tactical Patterns

## Mission

Codex MUST help model and implement the *tactical* building blocks of Domain-Driven Design, keeping the domain model 
expressive (not anemic), invariant-driven, and aligned with the ubiquitous language.

This skill is tactical-only: it does **not** decide bounded contexts or context mapping (strategic DDD). 
It assumes those boundaries exist and focuses on how we build the model *inside* them.

Key sources:
* Eric Evans — *Domain-Driven Design Reference* (pattern glossary and definitions).
* Martin Fowler — DDD overview, aggregates, ubiquitous language, and warnings about anemic models.
* Vaughn Vernon — effective aggregate design (consistency boundaries, aggregate collaboration, rules of thumb).

## Terminology

* Entity (Entity)
* Value Object (VO)
* Aggregate (Aggregate)
* Aggregate Root (AR)
* Domain Event (Event)

## When to activate

Use this skill whenever the task includes any of:
* designing/refactoring domain model classes (entities, VOs, aggregates)
* implementing command handling / write-side behavior
* adding business rules / invariants / validations that are domain rules
* introducing repositories/factories/services in domain layer
* deciding aggregate boundaries, references between aggregates, consistency vs eventual consistency
* preventing “anemic domain model” drift

## Core principles (hard rules)

1) Ubiquitous Language is the API
   * Names of types, methods, and events MUST come from the domain language and stay consistent across code and discussions.
   * If the language is ambiguous, Codex MUST propose a better term and explain the tradeoff (1–3 options max).

2) No Anemic Domain Model
   * Domain objects MUST carry domain behavior and protect invariants; do not push all rules into “*Service*” classes 
     while entities are just getters/setters. Fowler calls this out as a recurring anti-pattern.

3) Aggregates are consistency boundaries
    * An Aggregate is a cluster treated as a single unit; it has exactly one Aggregate Root, the only entry point
      for external modifications.
    * Aggregates MUST be designed around transactional consistency boundaries, not around object graphs or structural relationships.
    * Invariants that must be strongly consistent MUST be enforced inside a single aggregate boundary
      (single transaction boundary).
    * Prefer smaller aggregates. If you “need” a huge object graph, that’s usually a modeling smell; consider eventual
      consistency and domain events between aggregates.
    * If two objects do not require atomic consistency, they SHOULD be modeled as separate aggregates.

4) Identity vs value
   * Entity: identity-based, lifecycle, equality by identity.
   * Value Object: immutable, equality by value, no conceptual identity (Evans reference).

5) Dependencies and references
   * Outside the aggregate, references should be to the Aggregate Root only (typically by its id), not deep object
     references. Vernon emphasizes controlling traversal and coupling between aggregates.

6) Non-null references
    * References MUST NOT use null to represent absence.
    * Absence MUST be modeled explicitly using Optional Value Objects or other domain types.
    * Null MUST NOT appear in domain model fields, method parameters, or return values.

## Tactical building blocks and what “done right” looks like

### Entity

Entities MUST:
* represent identity explicitly (e.g., `OrderId`, `EmployeeId` as Value Objects).
* avoid public setters for domain state.
* expose intention-revealing operations: `confirm()`, `assignRole()`, `closeCase()`.

Avoid:
* exposing mutators. Domain state MUST change only via intention-revealing operations on the Aggregate Root 
  (e.g. confirm(), close(), assignTo(...)) that enforce invariants.
* “property bags” mapped 1:1 to DB tables.

### Value Object

Value Objects MUST:
* be immutable.
* validate invariants in constructor/factory.
* implement value-based equality.
* make invalid states impossible.

Value Objects MUST NOT:
* expose mutators
* have identity

In this codebase, primitives and standard library scalar types (String, int, UUID, BigDecimal, Instant, etc.) MUST NOT 
appear outside hexagonal adapters.

Inside application and domain layers, values MUST be represented as explicit Value Objects. Codex MUST NOT introduce 
primitives into domain to “make it easier”.

Each Value Object MUST encode meaning, validation, and normalization rules of the ubiquitous language.

Allowed exceptions (rare): purely technical glue code, logging, serialization helpers, performance-critical hot paths
with explicit approval.

Meaning over representation: Value Object MUST model a business concept, not a storage/transport representation.
Good: `Money`, `EmailAddress`, `PortfolioTitle`, `LegalCaseNumber`, `UserId` etc.
Bad: `StringValue`, `IntValue`.

Normalization is part of the contract: Value Object MUST normalize input (trim, case rules, scale rules, canonical
formatting) in factory/constructor.

No raw value leakage: Value Object SHOULD avoid exposing raw primitives widely; prefer “tell, don’t ask”.
For example, instead of `email.value()` it is better to make `email.matches(domainPolicy)` or `email.isCorporate()`.
(Exceptions: adapters, serialization, persistence mapping.)

### Aggregate + Aggregate Root

Aggregate MUST:
- place invariant checks in root operations.
- ensure internal members are not directly mutable from outside.
- keep aggregate transactional scope minimal.
- make illegal states unrepresentable where possible.

Rule of thumb:
- If a rule must be enforced “right now, always”, keep it inside one aggregate.
- If a rule can be satisfied with a delay, use domain events and eventual consistency across aggregates.

### Aggregates in an Event-Sourced system

In this architecture, aggregates act as decision makers that produce domain events. Aggregates decide and emit
domain events.

An aggregate receives a command, evaluates domain invariants, and emits one or more Domain Events representing facts
that have occurred.

The primary responsibility of an aggregate is to decide whether a command is valid and which events must be produced.

Aggregate state MUST contain only the information required to make decisions and produce the next domain events.

Not all domain attributes must be stored inside the aggregate. If a value is not required for invariant checks or
event decisions, it SHOULD NOT be part of the aggregate state.

If a field does not influence any command decision or invariant, it probably does not belong in the aggregate.

### Domain Service

Use Domain Service only when:
* an operation is pure domain logic but does not naturally belong to a single entity/VO (Evans reference).

Codex MUST:
* keep domain services stateless (no infrastructure).
* prefer moving behavior into aggregates first, and only then extract when it truly doesn’t belong.

### Repository

Repository is a domain-side abstraction for retrieving and persisting aggregates (Evans reference).

Codex MUST:
* model repositories around aggregate roots only (e.g., `OrderRepository` returns `Order`).
* not expose persistence concerns in domain model.

### Factory

Factory creates complex domain objects/aggregates (Evans reference).

Codex MUST:
* use factories when creation requires invariants, defaults, or multi-step assembly.
* avoid “god factories” that embed infrastructure.

### Domain Event

Codex MUST:
* model events as *facts that happened* in the ubiquitous language (past tense naming).
* use events to coordinate across aggregates when strong consistency is not required (Vernon aggregate collaboration).

## Interaction rules for Codex (how to behave during implementation)

### Before coding (mandatory micro-checklist)

Codex MUST ask itself (internally) and reflect the answers in the output:
* What is the invariant? Where is it enforced?
* What is the aggregate root? What is inside/outside the boundary?
* Which objects are Entities vs Value Objects?
* Is there any “anemic drift” (rules in services, entities are data-only)?
* Are names aligned with ubiquitous language?

### During coding

Codex MUST:
* keep domain classes free from framework annotations where feasible (especially persistence-heavy ones) unless 
  required by the task.
* avoid leaking persistence or transport models into domain.
* keep operations intention-revealing and invariant-guarded.

Codex SHOULD:
* propose splitting an aggregate if it grows too large or needs cross-aggregate invariant enforcement (then suggest 
  event-based coordination).

## Anti-patterns and “stop signs”

1) Anemic Domain Model

    Symptoms:
    * entities are mostly getters/setters
    * all logic is in `*Service` classes
    * invariants are checked “somewhere else” or only at API boundaries
   
    Counteraction:
    * move rules into aggregate root operations; keep service thin.

2) Transaction spanning multiple aggregates

    Symptom:
    * one use case updates two aggregate instances in one transaction because “it’s simpler”
   
    Counteraction:
    * pick one aggregate as the transaction boundary; publish a domain event and react asynchronously for the rest
      (eventual consistency).

3) Deep object graph references across aggregates

    Symptom:
    * `Order` holds `Customer` entity reference and mutates it directly

    Counteraction:
    * reference by `CustomerId`, load separately when needed, coordinate via events/policies.

4) “Aggregate as a DTO”

    Symptom:
    * root exposes internal collections publicly and callers mutate them

    Counteraction:
    * encapsulate: expose read-only views, mutation methods on root only.

## Minimal examples (language-agnostic)

Entity operation:
- `Order.confirm()` checks: order is not already confirmed, has at least one line, payment method is set.

Value Object:
- `Money(amount, currency)` prohibits negative amounts for certain concepts, normalizes scale.

Aggregate boundary:
- `Order` aggregate owns `OrderLines` and `ShippingAddress` as VOs; it references `CustomerId` only.

Domain service:
- `PricingPolicy` calculates discounts given `Order` and `CustomerTier` when the logic truly does not belong to either
  alone.

## Output expectations

When Codex completes a task under this skill, it MUST include:
* a short “DDD tactical summary” (2–6 bullets) stating the chosen aggregate root, invariant location, and why.
* any tradeoffs (strong vs eventual consistency) when cross-aggregate behavior exists.
