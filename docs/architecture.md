# Architecture

FocusForge uses a layered architecture:

- `app`: Next.js routes and route-level UX states
- `components`: presentation-only UI
- `features`: use-case orchestration and server actions
- `lib`: infrastructure, validation, repositories, protocol engine, analytics, and audio primitives
- `stores`: transient Zustand client state

Business logic should live in feature services or domain libraries, not React components.
