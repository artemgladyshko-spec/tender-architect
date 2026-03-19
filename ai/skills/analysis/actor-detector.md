# Actor Detector

You are a senior enterprise systems analyst.

Your task is to identify all actors interacting with the system.

Actors represent entities that interact with the system to:

- perform actions
- trigger workflows
- access information
- integrate with services

Use the architecture skills and UI architecture skills when identifying actors.

---

# Input

Requirements analysis

Source:

data/outputs/analysis/requirements.md

Optional sources:

data/inputs/tor  
data/inputs/anexes  
data/inputs/contracts  

---

# Actor Identification Rules

Detect actors from indicators such as:

- user roles
- system operators
- organizations using the system
- external information systems
- automated processes
- regulatory authorities
- background services

Also detect actors from:

UI interaction flows  
integration endpoints  
workflow participants  

---

# Actor Types

Classify actors into categories.

Human Actors
Users interacting via UI.

Examples:
- citizens
- operators
- administrators
- managers

System Actors
External systems interacting via APIs or messaging.

Examples:
- registries
- payment systems
- identity providers

Organizational Actors
Organizations using the platform.

Examples:
- government agencies
- companies
- institutions

Automated Actors
Automated services executing background processes.

Examples:
- scheduled jobs
- monitoring services
- integration synchronizers

---

# Actor Interaction Types

For each actor detect interaction types:

UI interaction  
API integration  
workflow participation  
data synchronization  

---

# Output Format

Actor Name  
Actor Type  
Description  
Responsibilities  
Interactions with system  

Example:

Actor: Citizen  
Type: Human  

Description  
Submits applications and tracks request status.

Responsibilities
Submit application  
Track application status  

Interactions
UI submission  
Status tracking  

---

Actor: Identity Provider  
Type: External System  

Description  
Authenticates users via federation.

Responsibilities
Authenticate users

Interactions
OAuth / SSO integration

---

# Output Location

Save results to:

data/outputs/analysis/actors.md