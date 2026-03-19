---
name: ui-architecture-principles
description: Universal UI architecture principles for building maintainable, modular, and scalable web interfaces. Use when designing or reviewing application UI structure.
---

# UI Architecture Principles

These rules enforce a clean, scalable architecture for modern web interfaces.

They apply to any application type:
- tools
- dashboards
- admin systems
- AI applications
- SaaS products

## Architecture Philosophy

Interfaces must be built from **modular components**.

Every UI should follow a predictable hierarchy:

Application Shell  
Page  
Sections  
Components

Example:

ApplicationShell  
→ Page  
→ Section  
→ Component

This structure keeps UI scalable and maintainable.

---

## Layout Structure

When a layout shell exists, it should follow this pattern:

ApplicationShell  
PageContainer  
PageHeader  
PageContent  
Sections  
Components

The layout shell may contain:

- sidebar
- top navigation
- content area

Single-page tools may omit shell navigation and render only a centered page.

---

## Component Modularity

UI components must be:

- reusable
- isolated
- composable
- layout independent

Avoid components tightly coupled to page layout.

Components should receive data through props or configuration.

---

## Reuse Rules

Before creating a new component:

1. check existing shared components
2. reuse existing patterns
3. extend shared primitives instead of duplicating logic

Shared components should live in a dedicated shared layer.

---

## Design Principles

Use **minimal professional interface design**.

Guidelines:

Prefer:
- whitespace
- clean typography
- neutral colors
- simple containers
- subtle borders

Avoid:
- heavy shadows
- excessive decoration
- complex gradients
- visual noise

Interfaces should feel:

- professional
- calm
- structured
- readable

---

## Layout Behavior

Use flexible layout primitives such as:

- flex layouts
- grid layouts
- stacked containers

Spacing should be consistent across the interface.

Prefer spacing over separators.

---

## Responsive Rules

Every UI must support responsive layouts.

Desktop:

- sections may appear in multi-column layouts

Mobile:

- components stack vertically
- avoid horizontal scrolling
- controls expand to full width

Responsiveness must be handled inside shared components when possible.

---

## Component Size Guidelines

Prefer **small focused components**.

Example:

Instead of one large page component:

Bad

PageComponent
- statistics
- table
- chart
- filters
- actions

Better

PageComponent
- StatsSection
- DataTable
- ChartSection
- Filters
- ActionButtons

---

## Interface Clarity

Interfaces should focus on **clear task flow**.

Avoid placing many unrelated features on the same page.

A good page answers:

- What action is the user performing?
- What information is required?
- What result will be produced?

---

## Example UI Composition

Example single-tool interface:

PageHeader  
FileUploadComponent  
PrimaryActions  
ResultSection

Example analytics interface:

PageHeader  
StatsSection  
DataTable  
ChartsSection