# Skill: Nonfunctional Requirements Catalog

## Skill ID

nonfunctional-requirements-catalog

---

# Purpose

Provide a complete catalog of **non-functional requirements (NFRs)** used in system design.

---

# Categories

## 1. Performance

- Response time
- Throughput
- Latency

Example:
NFR-PERF-001

System SHALL respond within 2 seconds for 95% of requests.


---

## 2. Scalability

- Horizontal scaling
- Vertical scaling
System SHALL support 10,000 concurrent users.


---

## 3. Availability

- Uptime
- SLA
System availability MUST be 99.9%.


---

## 4. Reliability

- Failure tolerance
- Retry mechanisms
System SHALL retry failed requests 3 times.


---

## 5. Security

- Authentication
- Authorization
- Encryption
All data MUST be encrypted in transit (TLS 1.2+).


---

## 6. Maintainability

- Code quality
- Modularity
System SHALL follow modular architecture principles.


---

## 7. Observability

- Logging
- Monitoring
- Tracing
System SHALL log all external interactions.


---

## 8. Usability

- UI clarity
- Accessibility
System SHOULD comply with WCAG 2.1.


---

## 9. Compatibility

- Browsers
- OS
System MUST support latest 2 versions of major browsers.


---

## 10. Data Integrity

- Consistency
- Validation
System MUST ensure data consistency across services.


---

## 11. Backup and Recovery
System SHALL perform daily backups.
Recovery time MUST NOT exceed 1 hour.


---

## 12. Compliance

- Legal requirements
- Standards
System MUST comply with GDPR.


---

# Rule

Each NFR must be:

- measurable
- testable
- linked to architecture

---

# Anti-Pattern

Bad:
System should be secure

Good:
System MUST use OAuth2 authentication

---

# Output

Complete NFR set that defines system quality and constraints.