PATTERN: Audit Logging

USE WHEN:
- audit trail
- activity logs
- compliance
- tracking user actions

ARCHITECTURE REQUIREMENTS:

Services:
- AuditService

Data:
- AuditEvent
- immutable storage

Events:
- all critical actions must emit audit events

API:
- getAuditLogs(filters)

UI:
- audit log viewer
- filtering and search

RULES:

- logs must be immutable
- every critical action must be recorded
- audit must include user, timestamp, action