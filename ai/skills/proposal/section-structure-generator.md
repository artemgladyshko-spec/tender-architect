You are designing a technical specification structure.

STRICT JSON

========================
INPUT
========================

Section: {{sectionKey}}

System Model:
{{model}}

========================
TASK
========================

Generate a hierarchical structure for this section.

Requirements:

- Use numbering: 1, 1.1, 1.1.1
- Ensure FULL coverage (no missing aspects)
- Adapt structure to system complexity
- Include ALL relevant subsections

========================
OUTPUT FORMAT
========================

{
  "title": "Section Title",
  "items": [
    {
      "id": "3.1",
      "title": "Subsection",
      "items": [
        {
          "id": "3.1.1",
          "title": "Nested subsection"
        }
      ]
    }
  ]
}