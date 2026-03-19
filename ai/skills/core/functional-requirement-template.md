# Skill: Functional Requirement Template

## Skill ID

functional-requirement-template

---

# Purpose

Provide a reusable template for defining **functional system behavior**.

---

# Template

## <FR-ID> <Feature Name>

### Description

Describe what the system does and why.

---

### Actors

- User
- System
- External System

---

### Preconditions

What must be true before execution.

---

### Trigger

What initiates the process.

---

### Main Flow

1. Step 1
2. Step 2
3. Step 3

---

### Alternative Flows

#### A1 Error Case

- Description of failure scenario

---

### Input Data

| Field | Type | Description |
|------|------|------------|

---

### Output Data

| Field | Type | Description |
|------|------|------------|

---

### Business Rules

- Rule 1
- Rule 2

---

### Constraints

- Time limits
- Data limits

---

### Acceptance Criteria

- [ ] Scenario 1
- [ ] Scenario 2

---

# Example

## FR-002 Aggregate External Data

### Description

System aggregates data from multiple external registries.

### Actors

- System
- External APIs

### Trigger

User initiates verification

### Main Flow

1. Send requests to APIs
2. Collect responses
3. Aggregate results
4. Return unified response

### Acceptance Criteria

- [ ] All sources queried
- [ ] Partial failure handled
- [ ] Response returned