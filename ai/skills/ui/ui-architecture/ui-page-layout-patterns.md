---
name: ui-page-layout-patterns
description: Defines canonical page layout patterns used to build consistent user interfaces across tools, dashboards, analytics pages, and CRUD systems.
---

# Page Layout Patterns

Applications often reuse a small number of page layout types.

Instead of inventing layouts for every page, interfaces should follow established layout patterns.

This ensures consistency, usability, and faster development.

---

# Layout Philosophy

Pages should follow predictable structures.

Users should always understand:

where they are  
what they can do  
what information is displayed

---

# Core Layout Elements

Most page layouts are composed of the following elements:

PageHeader  
PrimaryActions  
Filters  
ContentArea  
SidePanel (optional)

---

# Layout Pattern: Tool Interface

Used for task-focused tools such as:

AI tools  
document analyzers  
file converters  
search tools

Example:

Tender Analyzer

Structure:

PageHeader  
UserInputSection  
PrimaryAction  
ResultSection

Example flow:

Upload Document  
Run Analysis  
View Results

---

# Layout Pattern: Dashboard

Used for system overview pages.

Structure:

PageHeader  
MetricsRow  
WidgetsGrid

Typical widgets:

statistics cards  
charts  
activity logs  
system status

Widgets should be modular and reusable.

---

# Layout Pattern: Data Management (CRUD)

Used for managing datasets such as:

users  
documents  
organizations  
transactions

Structure:

PageHeader  
PrimaryActions  
Filters  
DataTable  
Pagination

Optional:

SidePanel for editing records.

---

# Layout Pattern: Analytics Page

Used for data exploration.

Structure:

PageHeader  
Filters  
Charts  
DataTable

Charts should appear above raw data.

---

# Layout Pattern: Detail Page

Used for displaying a single entity.

Examples:

document view  
user profile  
transaction details

Structure:

PageHeader  
EntitySummary  
InformationSections  
RelatedData

---

# Layout Pattern: Settings Page

Used for configuration.

Structure:

PageHeader  
SettingsSections

Each section contains:

label  
description  
control

Examples of controls:

switch  
dropdown  
input field

---

# Layout Selection

When creating a page:

1. identify the page purpose
2. select the closest layout pattern
3. adapt the pattern if necessary

Avoid mixing multiple layout patterns unnecessarily.

---

# Layout Consistency

Pages belonging to the same feature should follow the same layout pattern.

Example:

All document-related pages use the same structure.

---

# Benefits

Using layout patterns ensures:

consistent UI  
predictable navigation  
faster UI generation  
easier maintenance