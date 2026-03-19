PATTERN: Integration Gateway

USE WHEN:
- external systems
- APIs
- data exchange

ARCHITECTURE REQUIREMENTS:

Components:
- API Gateway
- Integration Service

Protocols:
- REST / gRPC / messaging

Patterns:
- retry
- circuit breaker

RULES:

- all external calls go through integration layer
- no direct external access from domain services