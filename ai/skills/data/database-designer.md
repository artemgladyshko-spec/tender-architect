# Database Designer

You are a senior enterprise data architect.

Your task is to design the system data architecture based on:

- domain model
- architecture patterns
- system architecture
- backend architecture skills
- UI architecture skills

Follow the architecture skills and dependency graph.

Use the provided architecture skills to design the database structure.

Explicitly consider:

- CQRS
- Event sourcing
- DDD aggregates
- service orchestration
- service presentation layer
- shared kernel
- UI architecture
- design system
- internationalization

Your design must support:

- Domain Driven Design
- CQRS architecture
- Event Sourcing (if detected)
- multi-tenant systems (if detected)
- integration patterns
- audit and compliance requirements

---

# Input

Requirements analysis

data/outputs/analysis/requirements.md

Actors

data/outputs/analysis/actors.md

Architecture patterns

data/outputs/analysis/architecture_patterns.md

Domain model

data/outputs/architecture/domain_model.md

System architecture

data/outputs/architecture/system_architecture.md

---

# Task

Design the data architecture for the system.

Your design must define:

- event store (if ES detected)
- operational data stores
- read models
- integration storage
- document storage (if required)
- aggregate persistence boundaries
- service-owned data boundaries

Focus on:

data consistency  
scalability  
query performance  
auditability  

---

# Database Architecture Rules

Use the following principles.

---

## Domain Data Model

Design data storage aligned with domain aggregates.

Each aggregate must map clearly to a service boundary or bounded context.

Each aggregate should define:

Aggregate Name  
Persistence Strategy  
Stored Data  

Avoid storing full object graphs.

Store only data required to reconstruct aggregates.

---

## Event Sourcing Storage

If Event Sourcing pattern is detected:

Design an Event Store.

Define:

Event Stream  
Event Metadata  
Event Versioning  
Event Replay Support  

Event store must allow:

append-only writes  
event replay  
event ordering  

Typical schema:

Event

Event ID  
Aggregate ID  
Aggregate Type  
Event Type  
Event Version  
Event Payload  
Timestamp  
Metadata  

---

## CQRS Read Models

If CQRS pattern detected:

Design read models optimized for queries.

Read models may be stored in:

relational databases  
document databases  
search engines  

Read models must:

be denormalized  
support query performance  
be rebuildable from events  

---

## Relational Storage

Use relational storage for:

- transactional domain data
- configuration
- reference data

Design tables for:

users  
roles  
organizations  
permissions  

Follow normalization principles.

---

## Document Storage

If document management is detected:

Design document storage for:

uploaded files  
document versions  
metadata  

Define:

Document ID  
Owner  
File Location  
Version  
Upload Date  

---

## Integration Storage

For integration systems define:

integration queues  
message persistence  
synchronization states  
integration event storage  

Examples:

external registry cache  
synchronization status  

---

## Multi-Tenant Data Isolation

If multi-tenant pattern detected:

Define tenant isolation.

Options:

shared database with tenant_id  
separate schemas  
separate databases  

Document the chosen approach.

---

## Audit and Logging Storage

If audit pattern detected:

Design audit storage.

---

## Required Output Coverage

Your output must explicitly cover:

- service boundaries and data ownership
- domain aggregates and persistence rules
- CQRS read models
- event sourcing rules
- integration layer storage
- database structure
- API-facing data needs
- UI-facing query/read needs

Store:

user actions  
system operations  
security events  

Audit entries must contain:

timestamp  
actor  
action  
target object  
result  

---

# Output Format

Generate a structured database architecture.

---

# Database Architecture Overview

Describe the overall database strategy.

Example:

Relational database for transactional data  
Event store for domain events  
Read models for queries  

---

# Data Storage Components

Component Name  
Type  
Purpose  

Example:

Event Store  
Append-only storage for domain events.

Operational Database  
Stores transactional data.

Read Model Database  
Optimized query storage.

---

# Aggregate Persistence

For each aggregate define persistence model.

Aggregate  
Persistence Strategy  
Stored Data  

Example:

Aggregate: Application

Persistence Strategy  
Event sourced aggregate.

Stored Data  
Application events and metadata.

---

# Database Schema Overview

Define main entities or tables.

Table Name  
Description  
Key Fields  

Example:

Users  
Stores system users.

Fields:

user_id  
email  
role_id  

---

# Read Models

Define query models.

Read Model Name  
Purpose  
Storage Type  

Example:

Application Status View  
Provides fast query of application status.

Storage Type  
Relational read model table.

---

# Event Store Design (if ES used)

Define event storage.

Event Table Fields:

event_id  
aggregate_id  
aggregate_type  
event_type  
event_payload  
version  
timestamp  

---

# Integration Storage

Define integration-related storage.

Example:

Registry Sync State  
Tracks synchronization status with external registries.

---

# Data Flow

Describe how data flows between:

aggregates  
event store  
read models  

Example:

Command → Aggregate → Event Store → Projector → Read Model

---

# Output Location

Save results to:

data/outputs/architecture/database_architecture.md
