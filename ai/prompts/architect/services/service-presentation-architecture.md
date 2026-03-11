---
name: service-presentation-architecture
title: Service Presentation Architecture
category: architecture
version: 0.1
description: >
  Define presentation services responsible for APIs, BFF layers,
  and UI-facing query composition.
applies_to:
  - architecture
depends_on:
  - cqrs-read-models-pattern
scope:
  - services
owner: architecture
priority: high
---

# Presentation Service Architecture

## Mission

Presentation services provide **API and UI access** to system capabilities.

They operate only on **read models**.

## Responsibilities

Presentation services:

- expose APIs (REST, gRPC, GraphQL)
- query read models
- compose UI responses
- translate transport contracts

## Rules

Presentation services MUST NOT:

- access aggregates directly
- enforce domain invariants
- implement workflows

## Typical Use Cases

- BFF for frontend
- query APIs
- UI composition services