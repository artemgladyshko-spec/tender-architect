# Skill: Technical Specification Writing Rules

## Skill ID

technical-specification-writing-rules

---

# Purpose

Define strict rules for writing **clear, testable, and unambiguous requirements** in technical specifications.

---

# Core Rule

Every requirement MUST be:

- Clear
- Atomic
- Testable
- Unambiguous
- Measurable

---

# Requirement Syntax Standard

Use **RFC-style language**:

- MUST / SHALL — mandatory
- SHOULD — recommended
- MAY — optional

---

# Structure of a Requirement

Each requirement must include:
<ID> <Title>

Description:
<what the system does>

Input:
<what comes into the system>

Output:
<what is produced>

Constraints:
<limits, conditions>

Acceptance Criteria:
<how it is verified>

---

# Example (Correct)
FR-001 Data Retrieval

Description:
The system SHALL retrieve user data from external registry.

Input:
User identifier (ID)

Output:
Structured JSON response

Constraints:
Response time MUST NOT exceed 2 seconds

Acceptance Criteria:

Valid ID returns data

Invalid ID returns error

Response time <= 2s

---

# Anti-Patterns

## Vague Language

Bad:System should be fast

## Multiple Requirements in One
System retrieves and processes and stores data

## Hidden Logic
System works like current system


---

# Naming Convention

- FR — Functional Requirement
- NFR — Non-functional Requirement
- SEC — Security
- INT — Integration

---

# Traceability

Each requirement must be traceable to:

- business goal
- module
- test case

---

# Output

Well-structured, testable requirement set ready for:

- development
- QA
- acceptance