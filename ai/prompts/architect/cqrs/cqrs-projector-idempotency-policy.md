---
name: cqrs-projector-idempotency-policy
title: CQRS Projector Idempotency Policy
category: policy
version: 0.1
description: >
  Enforce idempotent projector behavior when applying domain events to read
  models. Processing the same event multiple times MUST NOT corrupt projections.
applies_to:
  - cqrs
  - projections
depends_on:
  - cqrs-projector-pattern
scope:
  - query
owner: architecture
priority: high
---

# CQRS Projector Idempotency Policy

## Mission

Projectors MUST remain idempotent.

Processing the same event multiple times MUST produce the same result.

## Why

Event streams may be replayed:

- during rebuild
- during retry
- after infrastructure failures

Therefore projections must tolerate duplicates.

## Implementation Techniques

Typical strategies include:

- event sequence numbers
- event ID tracking
- upsert semantics
- version-based updates

## Rule

Projection logic MUST satisfy:

same event processed twice → same final state

## Anti-patterns

Avoid:

- blind insert operations
- projections depending on external state
- projections that mutate state without checking event identity