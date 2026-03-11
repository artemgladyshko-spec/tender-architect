# Mascode Java Code Style (Codex‑Optimized)

This document defines **mandatory rules** for generating and modifying Java code in Mascode services.

These rules **override typical Java conventions** and **must always be followed by Codex**.

If any rule conflicts with common Java formatting, **this document takes priority**.

---

# 1. General Principles

Codex MUST follow these principles when producing code:

* Prefer **vertical formatting**.
* Prefer **clarity over compactness**.
* Never compress code into a single line when a vertical style rule exists.
* If unsure, **choose the more vertical version**.

---

# 2. Indentation

Hard rules:

* One indentation level = **exactly one TAB**.
* **Spaces must never be used for indentation**.
* Indentation is always relative to the outer block.

Example:

```
if (condition) {
	call();
}
```

---

# 3. Line Length

* Maximum line length: **120 characters**.

If a statement approaches the limit, **wrap vertically**.

---

# 4. Blank Lines

Blank lines MUST exist:

* after `package`
* between import groups
* before class members
* before each method

Inside methods:

* logical blocks may be separated by **one blank line**

Constraints:

- never more than **one** blank line in a row
- the file MUST end with a newline (last line is an empty line)

---

# 5. Spaces

Spaces MUST exist:

* after commas
* around operators
* before and after `{` and `}`

---

# 6. Return / Throw Formatting (HARD RULE)

The value returned by `return` or `throw` **MUST start on the next line**.

This rule applies to all forms:

* constructor calls
* method calls
* variables
* literals
* boolean values
* `null`
* any thrown exception instance

Forbidden:

```
return new Catalog(Set.of(), Set.of());
```

Required:

```
return
	new Catalog(Set.of(), Set.of());
```

Another example:

```
throw
	new IllegalStateException(message);
```

This rule applies **even if the expression is short**.

Forbidden:

```
return value;
```

Required:

```
return
	value;
```

Forbidden:

```
return true;
```

Required:

```
return
	true;
```

Forbidden:

```
throw new IllegalStateException(message);
```

---

# 7. Local Variables

Hard rules:

* All local variables MUST be `final`.
* The only exception is when mutation is required by the algorithm.

Forbidden:

```
InputStream in = Files.newInputStream(path);
```

Required:

```
final InputStream in = Files.newInputStream(path);
```

Forbidden:

```
for (Object value : list) {
```

Required:

```
for (final Object value : list) {
```

Forbidden:

```
if (value instanceof Map<?, ?> valueMap) {
```

Required:

```
if (value instanceof final Map<?, ?> valueMap) {
```

---

# 8. try-catch / try-with-resources (HARD RULE)

## 8.1 try-with-resources

Resource lists MUST always use **vertical formatting**.

Forbidden:

```
try (InputStream in = Files.newInputStream(path)) {
```

Required:

```
try (
	final InputStream in = Files.newInputStream(path)
) {
```

Multiple resources:

```
try (
	final InputStream input = ...;
	final OutputStream output = ...
) {
```


## 8.2 catch formatting

`catch` MUST use vertical formatting.

Required:

```
} catch (
	final IOException e
) {
```

This formatting also applies to multi-catch:

```
} catch (
	final IOException | UncheckedIOException e
) {
```

---

# 9. File Structure (HARD RULE)

## 9.1 Interface file layout

Order MUST be:

1. `package`
2. blank line
3. `import` (own packages and libraries)
4. blank line
5. `import` (Java core)
6. blank line
7. `import static` (own packages and libraries)
8. blank line
9. `interface ...`
10. `extends ... {`
11. blank line
12. interface constants
13. blank line
14. interface methods
15. blank line
16. interface `default` methods
17. `}`

## 9.2 Class file layout

Order MUST be:

1. `package`
2. blank line
3. `import` (own packages and libraries)
4. blank line
5. `import` (Java core)
6. blank line
7. `import static` (own packages and libraries)
8. blank line
9. class annotations (each on its own line)
10. class declaration and body

Class member order inside `{ ... }` MUST be:

* static members
* instance members
* default constructor
* other constructors
* static factory methods
* `@Override` methods of interfaces
* `@Override` methods of base classes
* public static methods
* public methods
* private static methods
* private methods
* inner classes

---

# 10. `implements` / `extends` Formatting (HARD RULE)

Rules:

* break after class name
* put `implements` (or `extends`) on a new line
* each type on its own line (comma-separated)
* align type names with spaces (this is the only allowed indentation-with-spaces case)

Example:

```java
class SimpleClass
	implements SimpleOneInterface,
	           SimpleTwoInterface,
	           SimpleThreeInterface {

}
```

When implementing multiple interfaces, the “main” interface (if clear) should be first.

---

# 11. Assignments

## 11.1 Assignment Formatting (HARD RULE)

If the right side is complex, it MUST be placed on the next line.

If an assignment is wrapped vertically, **nothing from the right side may remain on the same line after `=`**.

This applies to:

* constructor calls
* static factory calls
* method calls
* stream chains
* fluent builders
* any multiline right-hand side

Preferred:

```
final Catalog catalog =
	loadCatalogFromLocationsUsingLanguage(
		location.stream(),
		internationalization.currentLanguage()
	);
```

## 11.2 Assignment With Call Chains (HARD RULE)

Do NOT leave a single word after `=`.

Forbidden:

```
final List<CreateCommand> commands = request
	.stream()
	.map(CreateCommand::of)
	.toList();
```

Required:

```
final List<CreateCommand> commands =
	request
		.stream()
		.map(CreateCommand::of)
		.toList();
```

The same rule applies even when the right side starts with a class name or factory method.

Forbidden:

```
final ReadAllOptions options = ReadAllOptions
	.get()
	.maxCount(PAGE_SIZE);
```

Required:

```
final ReadAllOptions options =
	ReadAllOptions
		.get()
		.maxCount(PAGE_SIZE);
```

---

# 12. Method Signatures

Rules:

- each argument on a new line
- in **concrete class methods** (class methods with a body, interface `default` methods), each argument MUST be `final`
- in **interface method declarations** arguments MUST NOT be `final`
- in **abstract method declarations**, arguments MUST NOT be `final`

Example for class:

```
final class CatalogRepository {

	public Catalog load(
		final CatalogId catalogId,
		final Language language
	) {
```

Example for interface:

```
interface CatalogRepository {

	Catalog load(
		CatalogId catalogId,
		Language language
	);

	default String indexName(
		final String prefix
	); {
		return
			prefix + "_catalog";
	}
}
```

---

# 13. Throws Lists

If a throws list is long, it MUST be split vertically.

Example:

```java
public void handle(
	final Request request
) throws NullPointerException,
	FirstRuntimeException,
	SecondRuntimeException {
	...
}
```

---

# 14. Method Calls

Short calls may stay on one line **only if truly trivial**.

Otherwise:

```
final CreateCommand command =
	CreateCommand.create(
		identityProvider,
		dateDefinition
	);
```

---

# 15. Prefer Intermediate Variables Over Complex Expressions (HARD RULE)

Long call chains or complex expressions inside method arguments SHOULD be avoided.

Codex SHOULD prefer introducing intermediate variables instead of nesting method calls or building long expressions
directly inside arguments.

Forbidden:

```
service.process(repository.find(id).calculateSomething(context).toResult());
```

Preferred:

```
final DomainObject object = repository.find(id);
final CalculationResult calculationResult = object.calculateSomething(context);
service.process(calculationResult.toResult());
```

The goal is:
* improve readability
* make debugging easier
* simplify future refactoring

Rules:
* avoid complex expressions inside method arguments
* prefer one logical operation per line
* prefer named intermediate variables

---

# 16. Stream Chains

Streams should normally use **vertical style**.

```
collection
	.stream()
	.map(Entity::of)
	.collect(toList());
```

---

# 17. Inside-Method Structure

Rules:

* Inside a method, logical blocks may be separated by **one blank line**.
* Before `return` or `throw` (if it is not the only statement), add **one blank line**.
* Prefer keeping method size <= 30 lines.

---

# 18. Annotations Ordering (HARD RULE)

## 18.1 Annotations prioritization

Annotations MUST be ordered from “global / important” to “local / overriding”:

* role-defining annotations first
* creation/instantiation annotations next
* annotations generating methods
* annotations defining fields/members
* annotations overriding behavior

Hard constraints:

* each annotation is on its own line

Example:

Example:
```
@Component
@NoArgsConstructor
@RequiredArgsConstructor
@AllArgsConstructor
@Accessors
@Getter
@Slf4j
@EqualsAndHashcode
@ToString
```

## 18.2 Annotation Arguments Formatting

If an annotation has more than one argument, each argument MUST be on its own line with one TAB indentation.

Required:

```
@SomeAnnotation(
	first = "...",
	second = "...",
	third = "..."
)
@AnotherAnnotation(first = "...")
```

Exception (allowed to stay in one line):

```
@Field(name = "...", type = "...", format = "...")
```

---

# 19. Class Design Rules

Classes must follow these constraints:

* a class must be **final or abstract**
* smallest possible visibility
* prefer immutability

---

# 20. Naming (Quick Rules)

* Class names: PascalCase
* Variable names: camelCase
* Static final constants: SCREAMING_SNAKE_CASE
* Package names: snake_case
* Abbreviations count as a single word

Interfaces / classes:

* name as singular noun, no prefixes/suffixes (except explicit architecture conventions)

Methods (CQS preference):

* commands: change state, return void (or no meaningful result), start with a verb
* queries: do not change state, return a result, name as a noun where feasible

---

# 21. Static Methods

Public static methods are forbidden except:

* static factory methods
* enum helper methods

---

# 22. Lombok Policy

Allowed:

* `@Getter`
* `@Setter` (restricted usage)
* `@ToString`
* `@EqualsAndHashCode`
* `@RequiredArgsConstructor`
* `@AllArgsConstructor`
* `@NoArgsConstructor` (framework only)

Forbidden:

* `@Data`
* `@Builder`
* `@Value`
* `@SneakyThrows`
* `@UtilityClass`
* `@Cleanup`

Violation of these rules should be treated as **a critical issue**.

---

# 23. Priority of Rules

When rules conflict:

1. **Vertical formatting wins**
2. **Immutability wins**
3. **Readability wins over compactness**

Codex MUST prefer the **more explicit and vertical form** of code.

---

# 24. Invalid Style Examples (Never Generate)

```
return new Catalog(Set.of(), Set.of());
```

```
try (InputStream in = Files.newInputStream(path)) {
```

```
InputStream in = Files.newInputStream(path);
```

---

# 25. Preferred Style Examples

```
return
	new Catalog(Set.of(), Set.of());
```

```
try (
	final InputStream inputStream = Files.newInputStream(catalogIndex)
) {
```

```
final List<CreateCommand> commands =
	request
		.stream()
		.map(CreateCommand::of)
		.toList();
```

---

# 26. Method Call Formatting (HARD RULE)

If a method call has arguments, the preferred style is vertical.

Forbidden:

```
CreateCommand.create(identityProvider, dateDefinition);
```

Required:

```
CreateCommand.create(
	identityProvider,
	dateDefinition
);
```

Rules:

* each argument on a new line
* indentation level = one TAB

---

# 27. Call Chain Formatting

If a call chain contains more than one call, it MUST use vertical formatting.

Forbidden:

```
collection.stream().map(Entity::of).collect(toList());
```

Required:

```
collection
	.stream()
	.map(Entity::of)
	.collect(toList());
```

---

# 28. Constructor Calls

Constructor calls SHOULD prefer vertical style when used in assignments or return statements.

Preferred:

```
return
	new Catalog(
		Set.of(),
		Set.of()
	);
```

---

# 29. Defensive Rule Against Compact Style

Codex MUST avoid compact Java formatting patterns even if they are common in typical Java code.

Never generate compact forms such as:

```
return new Something(...);
return value;
return true;
throw new IllegalStateException(...);
try (Resource r = ...) {
method(a, b);
```

Always prefer the expanded vertical version.

---

# 30. Conflict Resolution

When multiple formatting options are possible:

1. Prefer **vertical formatting**.
2. Prefer **one statement per line**.
3. Prefer **explicit variables instead of chained calls**.

If uncertain, generate the **most explicit and vertically structured version** of the code.

---

End of document.
