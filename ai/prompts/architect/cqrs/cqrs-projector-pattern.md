---
name: cqrs-projector-pattern
title: CQRS Projector Pattern
category: pattern
version: 0.1
description: >
  Define how domain events are transformed into read model updates.
  Projectors consume domain events and update query projections.
applies_to:
  - architecture
  - cqrs
  - projections
depends_on:
  - naming-dictionary
  - es-event-sourcing-rules
  - cqrs-read-models-pattern
scope:
  - query
owner: architecture
priority: high
---

# CQRS Projector Pattern

## Mission

Projectors translate **domain events into read model updates**.

They are part of the **read side of CQRS**.

## Responsibilities

Projectors MUST:

- consume domain events
- update read model storage
- remain deterministic
- remain idempotent

Projectors MUST NOT:

- emit domain events
- call aggregates
- perform business decisions

## Flow

Domain Event  
→ Projector Handler  
→ Transform Event  
→ Persist Read Model

## Projection Strategy

Projection logic SHOULD:

- map event attributes to query schema
- support denormalized structures
- allow independent schema evolution

## Anti-patterns

Avoid:

- embedding business logic in projectors
- cross-service synchronous calls
- event mutation inside projectors