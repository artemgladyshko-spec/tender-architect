---
name: ui-component-architecture
description: Guidelines for building reusable UI components and composable interface sections.
---

# Component Architecture

All interfaces should be composed of reusable components.

## Component Layers

Components exist in three layers:

Shared Components  
Feature Components  
Page Components

---

## Shared Components

Reusable across the entire application.

Examples:

Button  
Card  
Table  
InputField  
Modal  
FileUpload

Shared components should be generic and configurable.

---

## Feature Components

Used inside a specific feature or module.

Examples:

AnalysisResults  
DocumentPreview  
IntegrationTable  
UsageChart

Feature components compose shared components.

---

## Page Components

Page-level containers responsible for layout composition.

Pages assemble feature components.

Example:

AnalysisPage
- FileUpload
- RunAnalysisButton
- ResultsPanel

Pages should contain minimal logic.

---

## Composition Rules

Pages must be composed from components instead of embedding large UI blocks directly.

Avoid:

Very large page files.

Prefer:

Small composable blocks.

---

## Widget Compatibility

Components should remain layout-agnostic so they can become widgets.

A component should be able to work as:

- page section
- dashboard widget
- embedded block

---

## Container Pattern

Use container components to group UI blocks.

Example:

CardContainer  
WidgetContainer  
SectionContainer

Containers provide:

- padding
- titles
- consistent layout

---

## State Handling

Components should not manage global state.

Instead:

- receive data via props
- emit events or callbacks