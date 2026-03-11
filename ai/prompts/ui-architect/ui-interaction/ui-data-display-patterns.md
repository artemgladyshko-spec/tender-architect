---
name: ui-data-display-patterns
description: Defines standard UI patterns for displaying structured data such as tables, lists, cards, and analytics blocks.
---

# Data Display Patterns

Applications frequently display structured data.

Examples:

tables  
lists  
analytics blocks  
cards  
metrics

These patterns must follow consistent structure.

---

# Table Pattern

Tables should be used when displaying structured datasets.

Example:

Users  
Documents  
Transactions  
Integrations

---

# Table Structure

Standard table layout:

TableHeader  
TableBody  
TableRow  
TableCell

Common columns:

name  
status  
date  
actions

---

# Table Usability

Tables should support:

sorting  
filtering  
search  
pagination

Large datasets must not render fully at once.

---

# Table Actions

Row actions should appear in the final column.

Examples:

View  
Edit  
Delete

Avoid placing many buttons in each row.

---

# List Pattern

Lists are suitable for smaller datasets.

Example:

notifications  
messages  
activity logs

List structure:

ListContainer  
ListItem  
ListItemContent

---

# Card Pattern

Cards are useful for grouped information.

Examples:

document summary  
analysis results  
system statistics

Card structure:

CardHeader  
CardContent  
CardFooter (optional)

---

# Metrics Display

Metrics should be displayed using stat cards.

Example metrics:

Total Users  
Active Integrations  
Requests Today

Stat cards typically contain:

title  
numeric value  
trend indicator

---

# Filtering Pattern

When datasets grow large, provide filtering.

Common filters:

status  
date range  
category  
search field

Filters should appear above the table or list.

---

# Empty Data State

When no data exists:

display an empty state message.

Example:

"No data available."

Provide guidance if possible.

---

# Loading State

Data containers should support loading states.

Examples:

table skeleton loader  
card placeholder  
spinner