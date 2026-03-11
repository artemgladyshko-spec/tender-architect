---
name: service-domain-architecture
title: Service Domain Architecture
category: architecture
version: 0.1
description: >
  Define the internal architecture of a domain service responsible for
  write-side domain logic.
applies_to:
  - architecture
depends_on:
  - ddd-tactical-patterns
  - es-aggregate-pattern
scope:
  - services
owner: architecture
priority: high
---

# Domain Service Architecture

## Mission

Domain services implement the **write side of the domain model**.

They enforce business invariants and manage aggregates.

## Responsibilities

Domain services contain:

- aggregates
- command handlers
- domain events
- event persistence
- repository access

## Rules

Domain services MUST:

- enforce domain invariants
- coordinate aggregate operations
- persist domain events

Domain services MUST NOT:

- expose read model queries
- implement UI composition
- contain workflow orchestration

## Boundaries

Domain services align with **DDD bounded contexts**.