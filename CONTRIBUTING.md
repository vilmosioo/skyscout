# Contributing to Rubin Scout

Thank you for your interest in contributing to Rubin Scout!

## Development Workflow

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Make your changes in the appropriate package under `packages/`.

3. Ensure tests and type checks pass:
   ```bash
   npm run typecheck
   npm run test
   npm run build
   ```

4. Create a changeset describing your change:
   ```bash
   npm run changeset
   ```
   Follow the prompts to select the package and version bump level (`patch`, `minor`, or `major`).

5. Submit your Pull Request. Once CI passes and the PR is merged, the Changesets automation handles versioning and publishing.

## Code Standards

* **Web-Standard APIs**: Client packages prioritize web-standard APIs (`fetch`, `AbortController`) for wide runtime compatibility.
* **64-bit ID Precision**: Any JSON handling for Rubin data must use `parseLosslessJson` to prevent IEEE-754 precision loss on 18-digit IDs.
* **Hermetic Unit Tests**: Unit tests must use mock network responses and run offline without requiring external credentials.
