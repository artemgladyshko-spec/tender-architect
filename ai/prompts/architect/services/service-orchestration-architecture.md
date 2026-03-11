---
name: service-orchestration-architecture
title: Service Orchestration Architecture
category: architecture
version: 0.1
description: >
  Define orchestration services responsible for workflows, sagas,
  and coordination between domain services.
applies_to:
  - architecture
depends_on:
  - cqrs-projector-pattern
scope:
  - services
owner: architecture
priority: high
---

# Orchestration Service Architecture

## Mission

Orchestration services coordinate **long-running workflows**.

They react to events and issue commands.

## Responsibilities

Orchestration services:

- listen to domain events
- coordinate multiple services
- issue commands
- manage workflow state

## Typical Components

- saga handlers
- process managers
- retry logic
- deduplication logic

## Rules

Orchestration services MUST NOT:

- enforce domain invariants
- mutate aggregate state directly
- contain domain entity logic