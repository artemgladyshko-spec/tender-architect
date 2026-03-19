You are validating a technical specification document.

STRICT JSON

========================
INPUT
========================

Document Sections:
{{sections}}

System Model:
{{model}}

========================
TASK
========================

Detect inconsistencies across sections.

Check:

1. Service naming mismatches
2. API inconsistencies
3. Data model contradictions
4. Missing components in some sections
5. Security inconsistencies (RBAC, auth, audit)

========================
OUTPUT
========================

{
  "issues": [
    {
      "type": "naming",
      "description": "UserService vs AccountService mismatch",
      "sections": ["architecture", "api"]
    }
  ],
  "summary": "..."
}