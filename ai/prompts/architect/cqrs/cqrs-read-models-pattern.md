---
name: cqrs-read-models-pattern
title: CQRS Read Models Pattern
category: pattern
version: 0.1
description: >
  Apply CQRS read model design rules. Read models provide optimized query
  representations derived from domain events and MUST NOT enforce domain
  invariants or write-side decisions.
applies_to:
  - architecture
  - cqrs
  - read-model
depends_on:
  - naming-dictionary
  - es-event-sourcing-rules
scope:
  - query
owner: architecture
priority: high
---

# CQRS Read Models Pattern

## Mission

Read models provide optimized query representations derived from domain events.

They exist only for:

- search
- filtering
- UI composition
- reporting

Read models are **not part of the domain write model**.

## Core Rules

Read models MUST NOT be used for:

- domain invariants
- command validation
- write-side decisions

Write-side decisions always rely on **aggregate state reconstructed from events**.

## Read Model Design

Read models SHOULD:

- be denormalized
- be optimized for query patterns
- contain only query-relevant attributes
- evolve independently from write-side model

## Lifecycle

Event flow:

event → projector → read model update

Read models are **eventually consistent** with the write side.

## Anti-patterns

Avoid:

- using read models in aggregates
- validating commands with read models
- coupling read model schema to aggregate state