---
name: workspace-architecture
title: Workspace Architecture
category: policy
version: 0.1
description: Define Mascode project hierarchy (Projects → Product → Context → Service) and enforce structural awareness during analysis, refactoring, and review.
applies_to:
  - architecture
scope:
  - workspace
  - architecture
owner: platform
priority: high
---

# Mascode Project Structure Model

This skill defines the architectural meaning of folders in the local `Projects` directory.

Codex MUST interpret directory structure according to this model.

## Top-Level Layout

The local workspace contains:
```
Projects/
	anycase/
	ci-cd-templates/
	development/
	local-docker-hub/
	product-a/
	product-b/
	product-c/
```

Instead of name `Projects` it could be `projects`, `Mascode`, `mascode`, `Workspace`, `workspace`, `work`, `IdeaProjects` etc.

### Definitions

- `anycase/` – AnyCase Platform, shared platform product (internal product).
- `product-x/` – independent products.
- `ci-cd-templates/` – non-production tooling, not a product.
- `development/` – non-production tooling, not a product.
- `local-docker-hub/` – infrastructure storage, not a product.

Only `anycase/` and `product-x/` represent real products.

---

## Product

A product is:

- A logical top-level deliverable.
- A folder directly under `Projects/` (except tooling and infrastructure folders).
- May contain multiple contexts.

Example:
```
Projects/anycase/
Projects/product-a/
Projects/product-b/
Projects/something/
Projects/other-thing/
```

---

## Context

A context is:

- A DDD bounded context.
- A subfolder inside a product.
- A logical domain boundary.

Example:
```
Projects/anycase/prm/
Projects/anycase/forms/
Projects/product-a/analitycs/
Projects/product-b/maps/
```

Each context may contain multiple services and its own libraries.

---

## Service

A service is:

- A single deployable unit.
- A Git repository.
- Located inside a context folder.
- The only folder level that represents a Git root.

Example:
```
Projects/anycase/prm/user/
Projects/anycase/prm/organization/
Projects/product-b/maps/geo-tags/
```

Each service:
- Has its own `.git`
- May have its own `AGENTS.md`
- May have its own `.agents/skills`

---

## Structural Rules

1. Codex MUST treat a service as the smallest autonomous unit.
2. Cross-service changes require explicit justification.
3. Cross-context changes require architectural reasoning.
4. Cross-product changes require explicit high-level approval.

---

## Execution Context Awareness

Codex MUST detect where it was launched:

### If launched inside a service repo:
- Scope = that service only.

### If launched inside a context folder:
- Scope = all services in that context.

### If launched inside a product folder:
- Scope = all contexts and services of that product.

Codex MUST NOT assume access to sibling products unless explicitly requested.

---

## AnyCase Platform Components

AnyCase Platform is a shared platform product. It contains some folders that are not a separate context, and
subfolders there are not a service.

- `anycase/global-shared` is a Shared Kernel, set of shared libraries (Java implementations).
- `anycase/shared-packages` set of shared libraries (PHP implementations).
- `anycase/ui-components` set of base ui components (TS, React implementations).

---

## Architectural Boundaries

- AnyCase Platform contexts may be reused by products.
- Product-specific contexts MUST NOT modify platform contexts without explicit instruction.
- Naming, versioning, and API discipline must remain consistent across platform and products.

---

## Review Rules Based on Scope

If reviewing from:

- Service level → restrict findings to that repo.
- Context level → allow cross-service consistency checks.
- Product level → allow architectural consistency validation.

---

## Forbidden Assumptions

- Do not treat `Projects/` as a monorepo.
- Do not assume shared build system across services.
- Do not assume cross-service direct code access.

Each service is autonomous unless explicitly instructed otherwise.
