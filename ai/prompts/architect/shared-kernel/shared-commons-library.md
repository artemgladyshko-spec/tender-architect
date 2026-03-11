---
name: shared-commons-library
title: Shared Commons Library
category: shared-kernel
version: 0.1
description: >
  Use the shared commons library correctly when implementing domain and application
  code. Prefer existing shared-kernel abstractions, base classes, interfaces, and
  patterns instead of inventing ad hoc implementations.
applies_to:
  - java
  - domain-model
  - es
  - commands
depends_on:
  - naming-dictionary
  - java-code-style
  - ddd-tactical-patterns
  - ddd-value-objects-policy
scope:
  - domain
  - services
owner: platform
priority: high
---

# Shared Commons Library

## Mission

Codex MUST use the shared commons library as the default implementation toolkit for common domain-building patterns 
in this codebase.

This skill defines how to apply the shared-kernel library correctly and consistently, instead of inventing alternative 
local patterns.

This skill is implementation-specific.
It does not define architectural policy by itself.
Architectural intent is defined in higher-level skills such as:
* `ddd-tactical-patterns`
* `ddd-value-objects-policy`

This skill operationalizes those policies using the shared commons library.

## When to activate

Use this skill whenever the task includes any of:
* implementing or refactoring Value Objects
* implementing domain identifiers
* choosing base interfaces or base classes from shared kernel
* adding validation or transformation logic to domain values
* deciding how a domain type should be represented using shared commons abstractions
* reviewing code that reimplements patterns already provided by shared commons
* replacing ad hoc domain utility code with shared-kernel abstractions

## Core rule

Codex MUST prefer the shared commons library over local custom implementations whenever the library already provides 
a suitable abstraction or pattern.

Codex MUST NOT invent:
* alternative base classes
* parallel interfaces
* duplicate validation mechanisms
* duplicate transformation mechanisms
* local "mini-frameworks" that overlap with shared commons

Unless explicitly requested, shared commons is the default source of truth for these patterns.

## Scope of this skill

This skill governs how to use:
* shared interfaces
* shared abstract base classes
* shared conventions for domain value modeling
* shared validation hooks
* shared transformation hooks
* shared construction patterns
* shared equality contracts
* shared naming conventions related to the commons library

This skill does NOT define:
* bounded contexts
* aggregate boundaries
* domain invariants at the architectural level
* service responsibilities
* CQRS/Event Sourcing flow

## Decision order

When implementing a new common domain type, Codex MUST follow this order:

1. Check whether the concept should be modeled using an existing shared commons abstraction.
2. Choose the correct interface or base class from the shared library.
3. Follow the library-prescribed construction pattern.
4. Add validation using the shared validation mechanism.
5. Add transformation using the shared transformation mechanism.
6. Keep the resulting type aligned with ubiquitous language and higher-level DDD skills.

## Mandatory rules

### 1. Prefer existing abstractions

Codex MUST first search for an existing abstraction in shared commons before creating a new implementation.

Codex MUST NOT create local replacements for concepts already standardized in the library.

### 2. Follow library-prescribed structure

When a type is implemented using shared commons, Codex MUST follow the structure expected by the library.

This includes:
* correct inheritance
* correct interfaces
* correct construction style
* correct extension points
* correct validation/transformation hooks

### 3. Preserve domain meaning

Shared commons MUST be used to support the domain model, not flatten it.

Codex MUST keep names intention-revealing and aligned with ubiquitous language, even when using generic shared
building blocks.

### 4. No ad hoc variation

If the shared library defines a standard pattern, Codex MUST use that pattern consistently.

Codex MUST NOT introduce custom variations merely for convenience.

### 5. Keep implementation small and explicit

Codex SHOULD keep implementations minimal and declarative where the library already provides the mechanics.

Avoid boilerplate that duplicates behavior already provided by shared commons.

## Library usage patterns

### Value Objects (VOs)

There are two types of Value Objects:
* single value objects that represent a single concept (`UserId`, `EmailAddress`, `CaseNumber`)
* multi-value objects that represent a complex concept (`Money`, `Address`, `Coordinates`)

Both types of Value Objects are supported by the library.

All VOs implement the `ValueObject` interface through the `SingleValueObject` or `MultiValueObject` interfaces.

`BaseSingleValueObject` constructors accept two callbacks: `Transformation` functional interface and `Validation`
functional interface. These callbacks are used to transform (normalize, format, etc) and then validate
the value object if needed.

### Single value objects (SVOs)

Single value objects are simple types that represent a single concept.

Every SVO MUST extend the correct shared abstract base class:
* String: `EmptyByDefaultString`, `RequiredString`
* Integer: `NonNegativeInteger`, `ZeroByDefaultNonNegativeInteger`
* Long: `NonNegativeLong`, `ZeroByDefaultLong`, `ZeroByDefaultNonNegativeLong`
* Boolean: `RequiredBoolean`, `FalseByDefaultBoolean`, `TrueByDefaultBoolean`
* Bytes: `RequiredByteArray`
* Instant: `BaseRequiredMoment`, `BaseOptionalMoment`
* Date: `BaseRequiredDate`, `BaseOptionalDate`

Domain-specific interfaces for SVO are optional and MUST be introduced only when they already exist in the codebase or
are explicitly required. If introduced, SVO interface MUST extend the `SingleValueObject` interface.

Codex MUST prefer `BaseSingleValueObject` unless the task explicitly asks to introduce a new shared base class.

#### SVO Construction

Minimal set of constructors for SVO:
* private constructor with concept type value
* private constructor with concept value value supplier
* public `of()` static factory method with concept type value
* public `of()` static factory method with SVO of the same concept type value
* public `empty()` static factory method if this SVO is allowed to be empty

Exception: Instant and LocalDate SVO MUST also have `String`-based constructors.

### Multi-value objects (MVOs)

MVOs MUST
* extend the `BaseMultiValueObject.java` abstract class
* either be annotated with `@ToString` Lombok annotation or implement the `toString()` method printing fields manually

Domain-specific interfaces for MVO are optional and MUST be introduced only when they already exist in the codebase or
are explicitly required. If introduced, MVO interface MUST extend the `MultiValueObject` interface.

All MVOs MUST be JSON serializable/deserializable.

All fields of MVO MUST have `@JsonProperty` annotation for serialization.

#### MVO Construction

MVO MUST have private constructor, marked with `@JsonCreator` annotation, and all arguments marked with `@JsonProperty`
annotation. Every field of MVO MUST be initialized through the constructor or static factory method. Raw constructor
arguments from JSON MUST NOT be assigned to fields directly. They MUST first be converted to the corresponding Value
Objects or decorated collections.

Minimal set of constructors for MVO:
* private canonical constructor (Lombok `@AllArgsConstructor` allowed)
* private `@JsonCreator` constructor
* public `of()` static factory method wraps the canonical constructor
* public `ofNullable()` static factory method with SVO of the same type
* public `empty()` static factory method if this MVO is allowed to be empty

### Identifiers

Identifiers MUST
* implement the `anycase.shared.commons.domain.id.Id` interface
* be String-based objects (no UUIDs)
* have a `*Id` suffix unless ubiquitous language dictates otherwise

### Collection-based values

Shared Commons Library provides several decorators for collections:
* `DecoratedList` interface and its implementation `DecoratedArrayList`
* `DecoratedSet` interface and its implementation `DecoratedHashSet`
* `DecoratedMap` interface and its implementation `DecoratedHashMap`

These interfaces provide additional helper methods to the collections to simplify filtering, mapping,
elements access.

Collections stored inside Value Objects, Entities, Aggregates, commands, and events MUST use these decorators.

### Transformation rules

Codex MUST use the shared transformation mechanism instead of open-coded normalization.

Transformation runs before validation.

### Validation rules

Codex MUST use the shared validation mechanism instead of inventing custom validation style.

If validation fails, Codex MUST throw an exception - `RequiredValueIsEmpty`, `InvalidValue`, or other custom exception
extends `ValidationError`. If there are multiple validation errors, Codex MUST throw a `ValidationErrors`.

### Equality and comparison

Library already provides equality and comparison for all Value Objects.

## Naming conventions

There MUST be no general prefixes or suffixes for SVO and MVO that are required to be nonempty. If a domain type
allows empty values, `Optional` prefix MUST be used. Example: `Title` for required title value and `OptionalTitle`
for optional title value. If there are required and optional implementations, then required implementation MUST have
`toOptional()` method that returns optional implementation. Optional implementation MUST NOT have `toRequired()` method.

Collection-based interfaces MUST use plural names. Collection-based implementations MUST use suffixes: `*ArrayList`,
`*HashSet`, `*HashMap`.

Instant (timestamp) based SVOs MUST use `*At` suffix.

Date based SVOs MUST use `*On` suffix (exceptions: natural domain language words like `Birthdate`).

## Anti-patterns

### A. Reimplementing shared commons locally

Bad signs:
- local base classes duplicating shared ones
- local interfaces that mirror shared interfaces
- handwritten equality/validation/transformation already covered by the library

### B. Wrong abstraction choice

Bad signs:
- using the wrong shared base type for a domain concept
- choosing a more generic abstraction when a more specific one exists
- bypassing a specialized library type

### C. Framework-driven implementation

Bad signs:
- shaping the domain type around persistence/serialization concerns
- letting framework annotations dictate the model instead of the shared library

### D. Utility leakage

Bad signs:
- scattering normalization/validation logic outside the type
- pushing shared-commons responsibilities into services or mappers

## Review checklist

When reviewing code, Codex MUST check:
- Was an existing shared commons abstraction available?
- Was the correct interface or base class chosen?
- Does the implementation follow the library-prescribed construction style?
- Are validation and transformation implemented via shared mechanisms?
- Is any behavior duplicated locally that already exists in the library?
- Is the resulting type still aligned with ubiquitous language?
- Does the code avoid local mini-frameworks and parallel abstractions?

## Output expectations

When applying this skill, Codex MUST explicitly mention:
- which shared commons abstraction was chosen
- why that abstraction fits the case
- whether validation was added
- whether transformation was added
- whether any local alternative was intentionally rejected

## Examples

Examples below are canonical patterns. Unless a rule above states MUST, do not assume every detail is mandatory for
every type.

String-based optional single value object:

```java
public final class OptionalCaseNumber
	extends EmptyByDefaultString
	implements SingleValueObject<String> {

	private static final String VO_NAME = "Optional Case Number";

	private OptionalCaseNumber(
		final String value
	) {
		super(
			VO_NAME,
			value,
			defaultLength
		);
	}

	private OptionalCaseNumber(
		final Supplier<String> supplier
	) {
		super(
			VO_NAME,
			supplier,
			defaultLength
		);
	}

	public static OptionalCaseNumber of(
		final String value
	) {
		return
			new OptionalCaseNumber(value);
	}

	public static OptionalCaseNumber of(
		final SingleValueObject<String> vo
	) {
		return
			new OptionalCaseNumber(vo::value);
	}

	public static OptionalCaseNumber empty() {
		return
			new OptionalCaseNumber((String) null);
	}
}
```

String-based required single value object:

```java
public final class CaseNumber
	extends RequiredString
	implements SingleValueObject<String> {

	private static final String VO_NAME = "Case Number";

	private CaseNumber(
		final String value
	) {
		super(
			VO_NAME,
			value,
			defaultLength
		);
	}

	private CaseNumber(
		final Supplier<String> supplier
	) {
		super(
			VO_NAME,
			supplier,
			defaultLength
		);
	}

	public static CaseNumber of(
		final String value
	) {
		return
			new CaseNumber(value);
	}

	public static CaseNumber of(
		final SingleValueObject<String> vo
	) {
		return
			new CaseNumber(vo::value);
	}

	public OptionalCaseNumber toOptional() {
		return
			OptionalCaseNumber.of(this);
	}
}
```

Example of String-based value object that is required for transformation:

```java
public final class PhoneNumber
	extends RequiredString
	implements SingleValueObject<String> {
  
	private static final String VO_NAME = "Phone Number";

	private static final Transformation<String> TRANSFORMATION =
		s ->
			(s != null && s.startsWith("00"))
				? "+" + s.substring(2)
				: s;

	private PhoneNumber(
		final String value
	) {
		super(
			VO_NAME,
			value,
			defaultLength,
			TRANSFORMATION,
			noValidation()
		);
	}

	private PhoneNumber(
		final Supplier<String> supplier
	) {
		super(
			VO_NAME,
			supplier,
			defaultLength,
			TRANSFORMATION,
			noValidation()
		);
	}

	// ...implementation body as usual SVO...
}
```

Example of String-based value object that is required for validation:

```java
public final class OptionalEmail
	extends EmptyByDefaultString
	implements SingleValueObject<String> {

	private static final String VO_NAME = "Optional Email";

	private static final Validation<String> VALIDATION =
		value -> {
			if (value != null && !value.isBlank()) {
				if (!value.contains("@")) {
					throw
						new InvalidValue(
							"Email <%s> has invalid format. It should have @ sign.".formatted(value)
								+ " Please, provide a valid email address."
						);
				}
			}
		};

	private OptionalEmail(
		final String value
	) {
		super(
			VO_NAME,
			value,
			defaultLength,
			noTransformation(),
			VALIDATION
		);
	}

	private OptionalEmail(
		final Supplier<String> supplier
	) {
		super(
			VO_NAME,
			supplier,
			defaultLength,
			noTransformation(),
			VALIDATION
		);
	}

	// ...implementation body as usual SVO...
}
```

Example of the same validation for required value object (`RequiredString` base class guarantees that `value` will 
never be `null`):

```java
public final class Email
	extends RequiredString
	implements SingleValueObject<String> {

	private static final String VO_NAME = "Email";

	private static final Validation<String> VALIDATION =
		email -> {
			if (!email.contains("@")) {
				throw
					new InvalidValue(
						"Email <%s> has invalid format. It should have @ sign.".formatted(email)
							+ " Please, provide a valid email address."
					);
			}
		};

	// ...implementation body as usual SVO...
}
```

Required identifier example:

```java
public final class UserId
	extends RequiredString
	implements Id {

	// ...implementation body as usual SVO...

}
```

Optional identifier example:

```java
public final class OptionalUserId
	extends EmptyByDefaultString
	implements Id {

	// ...implementation body as usual SVO...

}
```

Numeric-based required single value object:

```java
public final class ItemsQty
	extends NonNegativeInteger
	implements SingleValueObject<Integer> {

	private static final String VO_NAME = "Items Qty";

	private ItemsQty(
		final Integer value
	) {
		super(
			VO_NAME,
			value
		);
	}

	private ItemsQty(
		final Supplier<Integer> supplier
	) {
		super(
			VO_NAME,
			supplier
		);
	}

	public static ItemsQty of(
		final Integer value
	) {
		return
			new ItemsQty(value);
	}

	public static ItemsQty of(
		final SingleValueObject<Integer> vo
	) {
		return
			new ItemsQty(vo::value);
	}
}
```

Instant-based required single value object:

```java
public final class RegisteredAt
	extends BaseRequiredMoment<RegisteredAt> {

	private static final String VO_NAME = "Registered At";

	private RegisteredAt(
		final Instant value
	) {
		super(
			VO_NAME,
			value
		);
	}

	private RegisteredAt(
		final Supplier<Instant> supplier
	) {
		super(
			VO_NAME,
			supplier
		);
	}

	private RegisteredAt(
		final String value
	) {
		super(
			VO_NAME,
			value
		);
	}

	public static RegisteredAt of(
		final Instant value
	) {
		return
			new RegisteredAt(value);
	}

	public static RegisteredAt of(
		final AtTheMoment<?> value
	) {
		return
			new RegisteredAt(value::value);
	}

	public static RegisteredAt of(
		final String value
	) {
		return
			new RegisteredAt(value);
	}
}
```

LocalDate-based required single value object:

```java
public final class RequestSentOn
	extends BaseRequiredDate<RequestSentOn> {

	private static final String VO_NAME = "Request Sent On";

	private RequestSentOn(
		final LocalDate value
	) {
		super(
			VO_NAME,
			value
		);
	}

	private RequestSentOn(
		final Supplier<LocalDate> supplier
	) {
		super(
			VO_NAME,
			supplier
		);
	}

	private RequestSentOn(
		final String value
	) {
		super(
			VO_NAME,
			value
		);
	}

	public static RequestSentOn of(
		final LocalDate value
	) {
		return
			new RequestSentOn(value);
	}

	public static RequestSentOn of(
		final String value
	) {
		return
			new RequestSentOn(value);
	}

	public static RequestSentOn of(
		final OnTheDate<?> vo
	) {
		return
			new RequestSentOn(vo::value);
	}
}
```

List of value objects:

```java
public final class CaseNumberArrayList
	extends DecoratedArrayList<CaseNumber> {

	private CaseNumberArrayList() {
	}

	private CaseNumberArrayList(
		final Collection<CaseNumber> collection
	) {
		super(collection);
	}

	private CaseNumberArrayList(
		final Stream<CaseNumber> stream
	) {
		super(stream);
	}

	private CaseNumberArrayList(
		final CaseNumber firstElement
	) {
		super(firstElement);
	}

	private CaseNumberArrayList(
		final CaseNumber... array
	) {
		super(array);
	}

	public static CaseNumberArrayList of(
		final Collection<CaseNumber> collection
	) {
		return
			new CaseNumberArrayList(collection);
	}

	public static CaseNumberArrayList of(
		final Stream<CaseNumber> stream
	) {
		return
			new CaseNumberArrayList(stream);
	}

	public static CaseNumberArrayList of(
		final CaseNumber firstElement
	) {
		return
			new CaseNumberArrayList(firstElement);
	}

	public static CaseNumberArrayList of(
		final CaseNumber... array
	) {
		return
			new CaseNumberArrayList(array);
	}

	public static CaseNumberArrayList empty() {
		return
			new CaseNumberArrayList();
	}
}
```

Optional multi-value object:

```java
@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
@Getter
@ToString
public final class OptionalParticipant
	extends BaseMultiValueObject {

	@JsonProperty("firstName")
	private final OptionalPersonFirstName firstName;

	@JsonProperty("lastName")
	private final OptionalPersonLastName lastName;
	
	@JsonProperty("tags")
	private final TagArrayList tags;

	@JsonCreator
	private OptionalParticipant(
		@JsonProperty("firstName") final String firstName,
		@JsonProperty("lastName") final String lastName,
		@JsonProperty("tags") final List<Tag> tags
	) {
		this(
			OptionalPersonFirstName.of(firstName),
			OptionalPersonLastName.of(lastName),
			TagArrayList.of(tags)
		);
	}

	public static OptionalParticipant of(
		final OptionalPersonFirstName firstName,
		final OptionalPersonLastName lastName,
		final TagArrayList tags
	) {
		return
			new OptionalParticipant(
				firstName,
				lastName,
				tags
			);
	}

	public static OptionalParticipant ofNullable(
		final OptionalParticipant participant
	) {
		return
			Optional
				.ofNullable(participant)
				.orElseGet(OptionalParticipant::empty);
	}

	public static OptionalParticipant empty() {
		return
			new OptionalParticipant(
				OptionalPersonFirstName.empty(),
				OptionalPersonLastName.empty(),
				TagArrayList.empty()
			);
	}

	@Override
	public boolean isEmpty() {
		return
			firstName.isEmpty()
				&& lastName.isEmpty();
	}

	public String asLastNameWithInitials() {
		return
			"%s %s%s".formatted(
				lastName.value(),
				firstName.initial().orElse("")
			).trim();
	}
}
```

Required version of the same multi-value object:

```java
@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
@Getter
@ToString
public final class Participant
	extends BaseMultiValueObject {

	@JsonProperty("firstName")
	private final OptionalPersonFirstName firstName;

	@JsonProperty("lastName")
	private final PersonLastName lastName;
	
	@JsonProperty("tags")
	private final TagArrayList tags;

	@JsonCreator
	private Participant(
		@JsonProperty("firstName") final String firstName,
		@JsonProperty("lastName") final String lastName,
		@JsonProperty("tags") final List<Tag> tags
	) {
		this(
			OptionalPersonFirstName.of(firstName),
			PersonLastName.of(lastName),
			TagArrayList.of(tags)
		);
	}

	public static Participant of(
		final OptionalPersonFirstName firstName,
		final PersonLastName lastName,
		final TagArrayList tags
	) {
		return
			new Participant(
				firstName,
				lastName,
				tags
			);
	}

	public static Participant ofNullable(
		final Participant participant
	) {
		return
			Optional
				.ofNullable(participant)
				.orElseThrow(() -> new RequiredValueIsEmpty("Participant"));
	}

	@Override
	public boolean isEmpty() {
		return
			false;
	}

	public String asLastNameWithInitials() {
		return
			"%s %s%s".formatted(
				lastName.value(),
				firstName.initial().orElse("")
			).trim();
	}
}
```

## Related skills
 
* `ddd-tactical-patterns`
* `ddd-value-objects-policy`
* `ddd-value-objects-example`

## Notes for future expansion

Possible future sections:
* migration rules from legacy types
* adapter mapping examples
* serialization guidance
* testing guidance for shared commons types
* library-specific dos and don'ts
