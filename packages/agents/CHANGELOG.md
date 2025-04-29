# @fiberplane/agents

## 0.5.3

### Patch Changes

- Clean up MCP support to use the now-designated `mcp` property on Agents.

## 0.5.2

### Patch Changes

- Fix an issue where importing Vite-specific env vars would break in Wrangler

## 0.5.1

### Patch Changes

- Fix listing gateways and avoid invalid agent registration

## 0.5.0

### Minor Changes

- Switch from Observed class decorator to withInstrumentation mixin

## 0.4.1

### Patch Changes

- Add support for accessing AI Gateway

## 0.4.0

### Minor Changes

- e08480b: Enable agents playground to see and inspect client connections

### Patch Changes

- e08480b: Fix the MCP discovery to use "duck typing"

## 0.4.0-canary.1

### Patch Changes

- Fix the MCP discovery to use "duck typing"

## 0.4.0-canary.0

### Minor Changes

- Enable agents playground to see and inspect client connections

## 0.3.8

### Patch Changes

- Allow playground to work with routing without routeAgentRequeset

## 0.3.7

### Patch Changes

- Fix an issue where accessing non-existing env variable would throw

## 0.3.6

### Patch Changes

- Fix registration of agent instances in certain cases

## 0.3.5

### Patch Changes

- Rename @Fiber to @Observed

## 0.3.4

### Patch Changes

- Design update & improved events view

## 0.3.3

### Patch Changes

- Fix missing events in events view

## 0.3.2

### Patch Changes

- Fix: remove auto code splitting as it was causing issues

## 0.3.1

### Patch Changes

- Fix versioned fetching

## 0.3.0

### Minor Changes

- This introduces proper routing for the agents playground. This means: users can refresh the playground and come back to the same state, state management is simplified.

## 0.2.1

### Patch Changes

- More robust agent instance interception and correct routing for admin API calls for frontend

## 0.2.0

### Minor Changes

- This release removes the vite-related components and introduces `fiberplane` wrapper for `fetch` entrypoint. It also includes significant UI updates

## 0.1.3

### Patch Changes

- Make sure that playground UI is wired properly

## 0.1.2

### Patch Changes

-

## 0.1.1

### Patch Changes

- Correctly build the package source

## 0.1.0

### Major Changes

- Initial publishing of the @fiberplane/agents

  **WHAT**: First public release of the @fiberplane/agents package.

  **WHY**: This package provides a robust integration between vite and agent-based development, enabling seamless agent interactions within vite applications.

  **HOW TO UPDATE**: As this is the first release, no updates are required from existing consumers.
