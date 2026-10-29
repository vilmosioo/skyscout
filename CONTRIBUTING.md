# Contributing to SkyScout

Thank you for your interest in contributing to SkyScout! We welcome contributions to astronomical mathematics, alert broker integrations, web tooling, and documentation.

---

## Tracking Issues & Feature Requests

Before starting work or if you encounter unexpected behavior:

1. **Check Existing Issues**: Search [GitHub Issues](https://github.com/vilmosioo/skyscout/issues) to see if the issue or feature is already being discussed.
2. **Submit an Issue or Feature Request**:
   * 🐛 **Bug Reports**: Use our [Bug Report Form](https://github.com/vilmosioo/skyscout/issues/new?template=bug_report.yml) to provide reproduction steps and environment details.
   * 💡 **Feature Proposals**: Submit a [Feature Request Form](https://github.com/vilmosioo/skyscout/issues/new?template=feature_request.yml) with your proposed design and API signatures.
   * 🔭 **Broker Integrations**: Request a new alert broker or telescope scout client using the [Integration Form](https://github.com/vilmosioo/skyscout/issues/new?template=broker_request.yml).
   * 💬 **Questions & Discussions**: Join [GitHub Discussions](https://github.com/vilmosioo/skyscout/discussions) to ask general questions or discuss ideas.

---

## Development Workflow

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Make your changes in the appropriate package under `packages/` or app under `apps/`.

3. Ensure tests, type checks, and builds pass:
   ```bash
   npm run typecheck
   npm run test
   npm run build
   ```

4. If you modified public packages (`@skyscout/core`, `@skyscout/gaia-client`, `@skyscout/lasair-client`), generate a changeset:
   ```bash
   npm run changeset
   ```
   Follow the interactive prompts to select the affected package(s) and version bump level (`patch`, `minor`, or `major`).

5. Submit your Pull Request against the `develop` branch. Once CI checks pass and the PR is merged, the automated Changesets release workflow manages versioning and npm publishing.

---

## Code Standards

* **Web-Standard APIs**: Client packages prioritize web-standard APIs (`fetch`, `AbortController`) for wide runtime compatibility across Node.js, Deno, Bun, and modern browsers.
* **64-bit ID Precision**: Any JSON handling for Rubin data must use `parseLosslessJson` to prevent IEEE-754 precision loss on 18-digit IDs (e.g. `diaObjectId`, `diaSourceId`).
* **Hermetic Unit Tests**: Unit tests must use mock network responses and run offline without requiring external credentials.
