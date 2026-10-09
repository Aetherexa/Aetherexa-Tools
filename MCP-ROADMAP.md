# Future MCP and standalone modules

The web utilities have a strict local-processing privacy boundary. An MCP server or hosted API would have a different boundary; it must not be added silently.

## Phase 1 — Shared core (included)

- Transport-neutral functions: `src/lib/csv.ts`, `dates.ts`, `orders.ts`, `prices.ts`.
- Registry: `src/lib/registry.ts` and adapter-ready contracts: `src/lib/tool-contracts.ts`.
- Browser-only image compression (`src/lib/image.ts`) remains separate.

## Phase 2 — SDK and MCP service (not included in V1)

- Move shared pure transforms to a dedicated `@aetherexa/tools-core` package.
- Implement a stateless stdio MCP adapter using a maintained MCP TypeScript SDK.
- Add robust JSON-schema input validation, size limits, error mapping, and conformance tests.
- Use separate image implementation for server-side tools if necessary; do not depend on DOM Canvas from Node.
- Keep remote HTTP MCP opt-in and document whether requests are logged or persisted.

## Phase 3 — Ecosystem integration

- Publish separate tool modules usable by VS Code extensions, Copilot Toolkit and external clients.
- Measure adoption with privacy-conscious, clearly disclosed, aggregate analytics only if introduced intentionally.
- Preserve free, no-login website functionality regardless of future optional integrations.
