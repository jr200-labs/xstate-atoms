# @jr200-labs/xstate-atoms

A collection of Jotai atoms for integrating XState with various technologies. This is a work-in-progress library.

## Features

- **Temporal Atoms**: Time-based reactive atoms for ticking and time granularity
- **NATS Atoms**: XState integration with NATS messaging system
- **DuckDB Atoms**: XState integration with DuckDB for in-browser analytics

## Installation

```bash
npm install @jr200-labs/xstate-atoms
```

## Usage

```typescript
import { useEpoch, useZonedTime } from '@jr200-labs/xstate-atoms'
// Import specific atoms as needed
```

## Examples

See the `examples/react-test` directory for working examples of each integration.

## Development

This is work-in-progress. APIs may change between versions.

## License

MIT
