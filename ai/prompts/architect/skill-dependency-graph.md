# Skill Dependency Graph

## Fundamentals

mascode-bootstrap
 ├─ workspace-architecture
 ├─ naming-dictionary
 ├─ proto-code-style
 └─ java-code-style

## Domain Modeling

ddd-tactical-patterns

## Event Sourcing

es-event-sourcing-rules
 └─ es-aggregate-pattern
      └─ es-aggregate-example

shared-es-library
 └─ es-aggregate-pattern

shared-commons-library

## CQRS Write Side

service-domain-architecture
 ├─ ddd-tactical-patterns
 └─ es-aggregate-pattern

## CQRS Read Side

cqrs-read-models-pattern
 └─ cqrs-projector-pattern
      └─ cqrs-projector-idempotency-policy

## Orchestration

service-orchestration-architecture
 └─ cqrs-projector-pattern

## Presentation

service-presentation-architecture
 └─ cqrs-read-models-pattern

## Testing

testing-aggregate-test-support-pattern
 └─ es-aggregate-pattern

testing-aggregate-test-support-example
 └─ testing-aggregate-test-support-pattern