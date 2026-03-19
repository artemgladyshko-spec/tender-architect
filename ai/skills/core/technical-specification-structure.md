# Skill: Technical Specification Structure

## Skill ID

technical-specification-structure

---

# Purpose

Define a standardized structure and rules for creating a **Technical Specification (Технічне Завдання / Technical Specification / System Specification)** for software systems and information systems.

The goal of this skill is to ensure that every technical specification:

- has a predictable structure
- separates requirements from architecture
- clearly defines system scope
- supports implementation, procurement, and acceptance
- is readable by business, architects, developers, and auditors

---

# When To Use

Use this skill when:

- creating a **Technical Specification (ТЗ)**
- preparing documentation for **government procurement**
- writing **system design specifications**
- documenting **architecture and requirements**
- preparing documents for **acceptance and commissioning**

---

# Core Principles

## 1. Separate Context, Architecture and Requirements

A technical specification must clearly separate:

- system context
- system architecture
- functional requirements
- non-functional requirements

Do **not mix architecture with requirements**.

---

## 2. One Concept Per Section

Each section must describe **one logical aspect of the system**:

Examples:

Good separation:
Architecture
Requirements
Security
Deployment
Acceptance

Bad structure:System description + requirements + architecture mixed together


---

## 3. Requirements Must Be Testable

Each requirement must be:

- measurable
- verifiable
- testable

Example:

Bad: The system should be fast.

Good: The system shall process requests within 2 seconds for 95% of requests.


---

## 4. Architecture Must Be Technology-Agnostic Where Possible

Architecture sections must describe:

- components
- responsibilities
- data flows
- integration patterns

Technology stacks may be specified but **architecture should not depend entirely on them**.

---

## 5. Traceability

Requirements must be traceable to:

- business goals
- functional modules
- acceptance tests

---

# Recommended Structure

## 1. General Information

Purpose: describe the context of the system.

Contents:

- project background
- legal basis
- system name
- stakeholders
- contractors
- timeline
- funding
- reference documents

Example:
1 General Information
1.1 Legal Basis
1.2 System Name
1.3 Stakeholders
1.4 Contractor
1.5 Project Timeline
1.6 Funding
1.7 Reference Documents


---

## 2. Business Context and Processes

Purpose: describe **how the system will be used**.

Contents:

- business processes
- actors
- operational context
- system goals

Example:
2 Business Context
2.1 Business Processes
2.2 Actors
2.3 Operational Environment
2.4 System Objectives


---

## 3. System Architecture

Purpose: define the **structural design of the system**.

Contents:
3 System Architecture
3.1 Architecture Overview
3.2 Component Architecture
3.3 Integration Architecture
3.4 Data Architecture
3.5 User Interface Architecture


Architecture should include:

- component diagrams
- system context diagrams
- integration flows

---

## 4. Data and Integration

Purpose: define **data flows and integrations**.

Contents:
4 Data and Integrations
4.1 Data Model
4.2 Data Storage
4.3 Data Exchange
4.4 External Systems
4.5 API Interfaces


---

## 5. Functional Requirements

Purpose: describe **system behavior**.

Structure:
5 Functional Requirements
5.1 Data Preparation
5.2 Data Processing
5.3 Data Retrieval
5.4 User Management
5.5 Reporting
5.6 Logging


Each requirement must contain:

- description
- input
- output
- expected behavior

---

## 6. Non-Functional Requirements

Purpose: define **quality attributes**.
6 Non-Functional Requirements
6.1 Performance
6.2 Scalability
6.3 Availability
6.4 Usability
6.5 Maintainability


Examples:

- response time
- throughput
- system load

---

## 7. Security Requirements

Purpose: define security mechanisms.
7 Security Requirements
7.1 Access Control
7.2 Authentication
7.3 Authorization
7.4 Encryption
7.5 Audit Logging


Security must cover:

- identity management
- transport security
- data protection

---

## 8. Reliability and Recovery

Purpose: define system resilience.
8 Reliability
8.1 Reliability Criteria
8.2 Failure Handling
8.3 Backup
8.4 Disaster Recovery


---

## 9. Deployment and Operations

Purpose: define how the system is deployed and operated.
9 Deployment and Operations
9.1 Deployment Architecture
9.2 Environments
9.3 Monitoring
9.4 Maintenance


---

## 10. Implementation Scope

Purpose: define project deliverables.
10 Implementation Scope
10.1 Scope of Work
10.2 Deliverables
10.3 Training
10.4 Pilot Operation


---

## 11. Acceptance and Validation

Purpose: define acceptance procedures.
12 Documentation
12.1 Technical Documentation
12.2 User Documentation
12.3 Operational Documentation


---

## 13. Change Management

Purpose: define how changes to the specification are handled.
13 Change Management
13.1 Change Process
13.2 Approval Procedure


---

# Common Mistakes

## Mixing Requirements and Architecture

Incorrect:
The system will use PostgreSQL and must respond in 2 seconds.

Correct:

Architecture:
The system uses PostgreSQL for persistent storage.

Requirements:

---

## Missing Non-Functional Requirements

Many specifications include only functional requirements.

Always include:

- performance
- reliability
- security
- scalability

---

## Undefined Integrations

External integrations must always specify:

- protocol
- data format
- authentication

---

# Outputs

A completed technical specification must include:

- system context
- architecture
- requirements
- deployment model
- acceptance procedures
- documentation requirements

---

# Related Skills

- system-architecture-pattern
- api-design-guidelines
- microservice-architecture-pattern
- service-domain-architecture
- event-driven-architecture