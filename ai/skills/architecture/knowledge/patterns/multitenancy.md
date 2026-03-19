PATTERN: Multitenancy

USE WHEN:
- multiple organizations
- tenant-specific data
- isolation requirements

ARCHITECTURE REQUIREMENTS:

Data:
- tenant_id in all domain entities

Services:
- tenant-aware services

Isolation:
- logical or physical isolation

API:
- tenant context required in all requests

RULES:

- no cross-tenant data leaks
- tenant must be resolved per request
- data isolation must be enforced