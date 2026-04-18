# AGENTS.md - React + DaisyUI + Electron Development Rules

## Purpose
This file defines mandatory engineering rules and best practices for this application.
All contributors and agents must follow these rules.

## Tech Stack
- React (TypeScript)
- DaisyUI (primary UI component system)
- Tailwind CSS (for layout/utilities only when DaisyUI is insufficient)
- Electron (via preload + secure bridge APIs)

## Core Principles
- Separation of concerns: UI, domain logic, infrastructure, and Electron integration must be isolated.
- DRY: avoid duplicated business rules, validation logic, and IPC wrappers.
- OOP-first design for business/domain layers.
- Composition over inheritance when possible.
- SOLID principles across services and modules.
- UI is a presenter/observer/triggerer only; UI must not contain business logic.

## Required Folder Boundaries
Use clear separation in `src`:

- `src/ui/`
  - React components, pages, feature views, presentational hooks.
  - No direct Electron API calls.
  - No direct business logic implementation.
- `src/services/`
  - Business logic services, use-case orchestration, domain workflows.
  - Implemented using OOP patterns (classes/interfaces/factories as appropriate).
- `src/context/`
  - React Providers for dependency injection and service exposure.
  - Context should expose typed service contracts.
- `src/hooks/`
  - UI-facing hooks that consume context/services.
  - Hooks can coordinate view state and invoke services, but must not implement core business rules.
- `src/electron/` (or equivalent separated area)
  - Electron-specific code only (bridge contracts, IPC adapters, Electron client wrappers).
  - Keep isolated from React view code.
- `electron/` (main/preload process files, if project uses root-level Electron folder)
  - Main process logic, preload script, secure IPC registration.

Do not mix UI modules and Electron-specific modules in the same folders.

## TypeScript Safety (Strictly Enforced)
- Use strict TypeScript settings.
- `any` is forbidden.
- `unknown` is forbidden unless immediately narrowed by a dedicated type guard in the same scope.
- Avoid type assertions (`as`) unless there is no safer alternative and justification is documented.
- All function inputs/outputs must be explicitly typed.
- Public service APIs must use exported interfaces/types.
- Runtime validation is required at trust boundaries (IPC payloads, persisted data, external input).

## UI Rules (React + DaisyUI)
- All interactive UI elements must use DaisyUI components/classes first.
- Non-DaisyUI styling is allowed only for layout and structural composition when DaisyUI does not provide needed layout behavior.
- Keep components presentational where possible; lift orchestration to hooks/services.
- Components must not directly call IPC or Electron globals.
- Components should receive data and actions through typed hooks/props only.

## Focus & Input Styling Rules
- Never use the default browser or DaisyUI hard outline/ring on focused inputs.
- All input focus states must use a soft glow effect defined globally in `src/index.css`.
- Focus glow must use DaisyUI CSS variable colors via `color-mix(in oklab, oklch(var(--p)) 30%, transparent)` so it automatically adapts to the active DaisyUI theme (light/dark).
  - Default (no modifier): uses `--p` (primary)
  - `.input-error`: uses `--er` (error)
  - `.input-success`: uses `--su` (success)
  - `.input-warning`: uses `--wa` (warning)
  - `.input-neutral`: uses `--n` (neutral)
- Do not hardcode focus ring colors in component files; all focus overrides live in `src/index.css` only.

## Business Logic Rules
- Business logic belongs only in `services` (or domain/use-case layers), never inside components.
- Services must be reusable, testable, and framework-agnostic.
- Services should depend on interfaces, not concrete infrastructure implementations.
- Use dependency injection via typed Providers.
- Keep state transitions explicit and deterministic.

## Context and Provider Rules
- Context is the application service access layer.
- Providers create and expose typed service instances.
- UI accesses services through hooks that read from context.
- Do not instantiate core services inside random components.
- Context values must be stable and memoized where relevant.

## Electron Integration Rules
- Access Electron capabilities only through preload-exposed bridge APIs.
- Never expose `ipcRenderer`, `require`, Node globals, or unrestricted channels directly to UI.
- Use explicit, allowlisted IPC channels and typed request/response contracts.
- Validate all IPC payloads at both preload and main boundaries.
- Keep Electron bridge contracts versioned and centrally defined.
- Use least-privilege API design: expose minimal methods required by features.

## Security Rules (Electron + App)
- `contextIsolation: true` is required.
- `nodeIntegration: false` is required for renderer.
- Preload must expose a narrow, typed, immutable API surface.
- Sanitize and validate all data crossing process boundaries.
- Do not execute dynamic code from untrusted sources.

## Design Pattern Guidance
Apply patterns pragmatically where they improve clarity and maintainability:
- Factory: create service instances with explicit dependencies.
- Adapter: wrap Electron IPC and external APIs behind service interfaces.
- Strategy: interchangeable business policies/algorithms.
- Observer: React UI subscribes to state changes via hooks/context.
- Repository (optional): abstract persistence boundaries.

Avoid overengineering; patterns must reduce coupling and improve testability.

## Testing and Quality Rules
- Linting and type checks must pass before merge.

## Page & Component Structure Rules
- A page file (`src/ui/pages/*.tsx`) must be a pure assembly of sub-components. It owns layout and wires props/callbacks, but contains no inline JSX logic beyond composition.
- Every sub-component that belongs to a page must live in a dedicated folder named after the page under `src/ui/components/`:
  ```
  src/ui/components/<PageName>/ComponentName.tsx
  ```
  Example for `LoginPage`:
  ```
  src/ui/components/Login/EmailField.tsx
  src/ui/components/Login/PasswordField.tsx
  src/ui/components/Login/LoginForm.tsx
  ```
- Shared components used by more than one page go in `src/ui/components/shared/`.
- The page file imports only from its own component folder and `shared/` — never raw HTML/JSX blocks inline.
- Component folders must not import from sibling page component folders; cross-page reuse goes through `shared/`.

## Naming and Structure Standards
- Use clear suffixes:
  - `*.service.ts` for business services
  - `*.provider.tsx` for providers
  - `use*.ts` for hooks
  - `*.bridge.ts` for Electron bridge contracts/wrappers
- Keep files focused; one primary responsibility per module.

## Prohibited Practices
- Business logic inside React components.
- Direct Electron IPC usage in UI components.
- Mixing domain/service logic with presentation code.
- `any` types and careless type assertions.
- Duplicated logic across components/services.

## Definition of Done (DoD)
A change is complete only if:
- Architecture boundaries are respected.
- Type safety rules are satisfied (`any` not used).
- UI uses DaisyUI-first approach.
- Business logic is implemented in services and accessed through context/hooks.
- Electron interactions use secure preload bridge patterns.
- Tests/typecheck/lint are updated and passing (where configured).
