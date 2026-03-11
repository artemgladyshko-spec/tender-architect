# Proto Rules (Mascode)

These rules define naming, versioning, service/message structure, meta-options, and compatibility constraints.

## 1) Naming

### Files
- File name MUST equal service name and MUST be `PascalCase` with version suffix.
  Example: `FindTaskV1.proto`

### Package
- Package names: lowercase dot-separated domain path (repository convention).
- Keep package aligned with repository language conventions (Java/Kotlin/etc).

### Services
- Service name MUST follow: `<CommandOrQueryName><Version>`
- Version suffix is mandatory: `V1`, `V2`, ...
- Example: `service ReassignRegionalExecutorV1`

### RPC methods
- RPC name MUST be the simple form of the command/query in lowerCamelCase.
  Example: `rpc reassign(...) returns (...)`

#### The "By..." rule (strict)
- `...ById` (and other `By...`) is allowed ONLY in RPC method names of a gRPC service AND ONLY if the service contains more than one RPC method.
- `By...` is forbidden in:
  - service names
  - file names
  - message names (except the explicitly allowed patterns below)
  - field names
  - enum names / enum value names

Allowed examples (multiple RPC methods case):
- `service FindTaskV1`
- `rpc findById(...) returns (...)`
- `rpc findByDefinitionId(...) returns (...)`

Message naming when `By...` is necessary:
- Request messages MUST include `By...` in the name, but the service name MUST remain without `By...`.

Examples:
- `message FindTaskByIdV1Request`
- `message FindTaskByDefinitionIdV1Request`
- `message FindTaskV1Response`

### Messages
- Message names: `PascalCase`
- Request/response messages are mandatory per RPC.

Mandatory templates:
- Request message name: `<ServiceName>Request`
- Response message name: `<ServiceName>Response`

Examples:
- `message ReassignRegionalExecutorV1Request`
- `message ReassignRegionalExecutorV1Response`

If `By...` is used (only in multi-RPC services), request messages follow:
- `message <ServiceNameWithoutBy><ByClause><Version>Request`
- Response message remains single for the service:
  - `message <ServiceName>Response`

### Fields
- Field names MUST be `lowerCamelCase` (project rule).
- Avoid generic names like `data`, `info`, `payload` when a domain term exists.
- Model optionality intentionally; do not overload sentinel values.

### Enums
- Enum names: `PascalCase` nouns.
- Enum values: `UPPER_SNAKE_CASE`.
- Keep enum value names explicit and stable.

## 2) Mandatory Versioning

Version suffix is mandatory for:
- Service name: `...V1`
- Request/Response messages: `...V1Request`, `...V1Response`
- File name: `...V1.proto`

Breaking changes MUST result in a new version.

## 3) Service / RPC / Message structure

- Define explicit request and response messages per RPC.
- Avoid primitive-only RPC signatures.
- Keep transport messages focused on API contract, not storage concerns.
- One message = one purpose. Split overloaded payloads.

## 4) RPC formatting

- `returns` MUST be placed on a new line.
- `returns` MUST be indented one level deeper than the `rpc` line.
- Indentation MUST use TAB characters only.
- Spaces for indentation are forbidden.

Correct:
```proto
rpc find(FindTaskV1Request)
	returns (FindTaskV1Response);
```

Incorrect:
```proto
rpc find(FindTaskV1Request) returns (FindTaskV1Response);
```

Incorrect (spaces used for indent):
```proto
rpc find(FindTaskV1Request)
        returns (FindTaskV1Response);
```

## 5) Meta-options (required)

Project defines custom metadata options. Every service, message, and field MUST have the corresponding option block:
- Service: `option(anycase.protobuf.service) = {...};`
- Message: `option(anycase.protobuf.message) = {...};`
- Field: field option `[(anycase.protobuf.field) = {...}]`

### Meta schema (reference)

```proto
extend google.protobuf.ServiceOptions {
	ServiceMeta service = 5001;
}

message ServiceMeta {
	string description = 1;
	RequestType type = 2;
	AccessType access = 3;
}

enum RequestType {
	QUERY = 0;
	COMMAND = 1;
}

enum AccessType {
	PRIVATE = 0;
	PUBLIC = 1;
}

extend google.protobuf.FieldOptions {
	FieldMeta field = 5002;
}

message FieldMeta {
	string description = 1;
	bool required = 2;
}

extend google.protobuf.MessageOptions {
	MessageMeta message = 5003;
}

message MessageMeta {
	string description = 1;
}
```

### Option block formatting (strict)

For service/message option blocks:
- No blank line before the `option(...)` block.
- No space after the keyword `option`.
	- Correct: `option(anycase.protobuf.service) = {`
	- Incorrect: `option (anycase.protobuf.service) = {`
- After the option block, there MUST be exactly one blank line.
- Each meta attribute MUST be on its own line.
- Prefer commas between attributes for readability.
- `description` MUST end with a period.

Example (service):

```proto
service FindTaskV1 {
	option(anycase.protobuf.service) = {
		description: "Сервіс пошуку Завдання.",
		type: QUERY,
		access: PRIVATE
	};

	rpc find(FindTaskV1Request)
		returns (FindTaskV1Response);
}
```
Example (message + field):

```proto
message FindTaskV1Request {
	option(anycase.protobuf.message) = {
		description: "Запит на пошук Завдання."
	};

	string id = 1 [(anycase.protobuf.field) = {
		description: "Ідентифікатор Завдання.",
		required: true
	}];
}
```

Notes:
- If commas are not accepted by a particular compiler/tooling in option text format, remove commas consistently. (Default preference is to keep commas.)

## 6) Compatibility and Evolution

Hard rules:
- Never change existing field numbers.
- Never reuse deleted field numbers or names.
- Always reserved removed field numbers and names.
- Add new fields with new numbers.
- Treat enum value removal/renaming as breaking unless there is an explicit compatibility strategy.

## 7) Review Checklist

- Verify naming conventions for all introduced/changed symbols (including naming-dictionary semantics).
- Verify version suffix presence and correctness (service/message/file).
- Verify field numbers are unique and stable.
- Verify removed fields are reserved (both number and name).
- Verify request/response message clarity per RPC.
- Verify mandatory meta-options exist and formatting rules are satisfied.
- Verify no domain-term drift relative to adjacent APIs.

## 8) Example Prompts
- "Design API for task reassignment workflow in .proto files."
- "Implement new Query service FindTaskV1 with required meta options."
- "Review protobuf refactor and find naming, versioning, or compatibility violations."
