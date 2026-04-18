# Backend Development Rules

## Core Principles

- The backend must be implemented as an Express.js application.
- Prisma must be used as the ORM with PostgreSQL as the database.
- Prisma setup and configuration must follow Prisma 7 guidelines.
- All backend code must follow DRY principles.
- All backend code must follow single responsibility principles.
- All backend code must be written using clear OOP patterns.
- Before implementing any feature, choose the design pattern that best fits the feature and keeps the code scalable and maintainable.
- Prefer proven design patterns that improve maintainability, reuse, and separation of concerns.
- All types must be explicit.
- Do not use `any`.
- Do not use `unknown`.
- If `unknown` appears necessary for a valid use case, ask for explicit approval before using it.

## Folder Structure Rules

- Organize backend code only under these folders: `config`, `controllers`, `routes`, `services`, `validators`, `schema`, `lib`, and `middleware`.
- `config` must contain centralized application configuration support and constants.
- `controllers` must contain request handlers only.
- `routes` must define route registration and route-to-controller mapping only.
- `services` must contain business logic and orchestration.
- `validators` must contain request validation logic built on top of schema definitions.
- `schema` must contain Zod schemas used for validation and type-safe contracts.
- `lib` must contain reusable singleton-based shared utilities and infrastructure abstractions.
- `middleware` must contain reusable Express middleware functions that are applied across multiple routes, such as authentication, authorization, and other cross-cutting concerns.
- The project structure description must stay at folder level only and must not document file-level structure.

## Application Composition Rules

- Express app initialization and route mounting belong in the application bootstrap layer.
- Application startup must remain separate from app initialization.
- Keep application composition minimal, explicit, and dependency-driven.
- Route handlers must remain thin and delegate business logic to services.
- Services must not take on validation responsibilities that belong to schemas and validators.
- Validation logic must be centralized and reusable.
- Shared infrastructure objects must be instantiated once and reused through controlled singleton access patterns.

## Configuration Rules

- All environment values must be loaded through a single singleton application configuration class.
- Accessing environment values directly through `process.env` outside that configuration class is prohibited.
- Configuration loading must be centralized, validated, and strongly typed.
- Consumers must depend on the configuration singleton instead of reading raw environment variables.
- Hardcoded values must not be scattered across the codebase.
- Any reusable hardcoded value must be defined centrally in constants.ts inside the config folder.

## Validation Rules

- Zod must be used for schema definitions and validations.
- Validation contracts must be explicit, reusable, and colocated within the schema-driven validation flow.
- Validators must rely on Zod schemas instead of duplicating validation rules in controllers or services.

## Maintainability Rules

- Keep controllers, services, validators, and schema responsibilities separate at all times.
- Avoid duplicating domain logic, validation logic, mapping logic, or configuration logic.
- Prefer composition over duplication.
- Prefer reusable abstractions only when they improve clarity and do not hide responsibility boundaries.
- Every class and module must have one clear reason to change.

## Package Management Rules

- Never directly write or edit `package.json` or `package-lock.json`.
- Use `npm init` to scaffold the project.
- Use `npm install <package>` to add production dependencies.
- Use `npm install --save-dev <package>` to add development dependencies.
- The only exception is the `scripts` field in `package.json`, which may be edited directly via `npm pkg set scripts.<name>="<cmd>"` or by editing the file after `npm init` has created it, since npm provides no CLI for managing scripts.

## Quality Gates

- Any change made in the backend must be followed by lint and build checks.
- Lint and build checks must pass with zero errors and zero warnings.
- A change is not complete until both checks pass cleanly.


