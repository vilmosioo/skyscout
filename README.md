# SkyScout Monorepo

[![CI](https://img.shields.io/github/actions/workflow/status/vilmosioo/skyscout/ci.yml?branch=develop&style=flat-square&label=CI)](https://github.com/vilmosioo/skyscout/actions)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg?style=flat-square)](./LICENSE)

Welcome to **SkyScout**, the base of operations for open-source astrophysics software, alert broker clients, and telescope discovery tools designed to follow and filter discoveries from wide-field surveys.

---

## Workspace Structure

This repository is organized as a lightweight Turborepo + npm workspaces monorepo, bundled with [tsup](https://tsup.egoist.dev/) for high-speed dual ESM/CommonJS distribution:

```text
skyscout/
├── .changeset/               # Multi-package release and versioning configuration
├── .github/
│   ├── ISSUE_TEMPLATE/       # Structured GitHub Issue forms (bugs, features, brokers)
│   └── workflows/
│       ├── ci.yml            # Fast, single-runner GitHub Actions CI
│       └── release.yml       # Automated npm publishing with provenance via Changesets
├── apps/
│   └── skyscout/             # skyscout (Vite 6 + React 18 interactive alert dashboard)
├── packages/
│   ├── core/                 # @skyscout/core (Shared astronomical math & coordinates)
│   └── lasair-client/        # @skyscout/lasair-client (Published to npm)
├── turbo.json                # Turborepo task pipeline configuration
├── package.json              # Monorepo root manifest
├── tsconfig.base.json        # Shared TypeScript compiler options
├── CONTRIBUTING.md           # Contribution and Changeset guide
└── LICENSE                   # BSD-3-Clause License
```

---

## Packages & Applications

| Package / App | Version | Description |
| :--- | :--- | :--- |
| [`@skyscout/core`](./packages/core) | `1.0.0` | Shared astronomical mathematics, time transformations, coordinate geometry, and photometry math |
| [`@skyscout/lasair-client`](./packages/lasair-client) | `2.0.0` | Fully-typed TypeScript client for the Lasair Rubin alert broker |
| [`skyscout`](./apps/skyscout) | `0.1.0` | Interactive web dashboard demonstrating alert queries, light curves, cone search, and Sherlock context |

---

## Project Tracking & Issues

* **Issue Tracker & Project Roadmap**: Track active development milestones, feature backlogs, and bug reports via our project board and GitHub Issues:
  * 🐛 [File a Bug Report](https://github.com/vilmosioo/skyscout/issues/new?template=bug_report.yml)
  * 💡 [Propose a Feature](https://github.com/vilmosioo/skyscout/issues/new?template=feature_request.yml)
  * 🔭 [Request a Broker Integration](https://github.com/vilmosioo/skyscout/issues/new?template=broker_request.yml)
  * 💬 [Join Discussions](https://github.com/vilmosioo/skyscout/discussions)

---

## Development Guide

### Prerequisites
* Node.js $\ge 20.0.0$
* npm $\ge 8.0.0$

### Quick Commands (Powered by Turborepo)

```bash
# Install all workspace dependencies
npm install

# Run unit tests across all packages (with Turborepo caching)
npm run test

# Type check across all packages
npm run typecheck

# Build all packages into ESM + CommonJS distribution bundles via tsup
npm run build
```

### Build & Tooling Architecture
* **[Turborepo](https://turbo.build/)**: Orchestrates dependency task pipelines (`build`, `test`, `typecheck`) with intelligent caching.
* **[tsup](https://tsup.egoist.dev/)**: Powered by `esbuild`, compiles TypeScript sources into dual ESM (`.js`) and CommonJS (`.cjs`) outputs while bundling TypeScript declaration maps (`.d.ts`, `.d.cts`) in sub-second builds.
* **[Vitest](https://vitest.dev/)**: Fast, native ESM unit test runner with co-located tests.

---

## Release Process (Publishing to npm)

We use [Changesets](https://github.com/changesets/changesets) for semver versioning, automated changelog generation, and npm publishing with OIDC provenance.

### 1. Documenting Changes
When introducing a change to a package:
```bash
npm run changeset
```
Select the package, choose the semver bump type (`patch`, `minor`, `major`), and enter a brief description of the change. This generates a markdown file in `.changeset/`.

### 2. Automated Publishing via GitHub Actions
When PRs containing changesets are merged into `develop`:
1. The **Release** workflow automatically opens a *"chore: version packages"* Pull Request bumping versions and generating `CHANGELOG.md`.
2. When that Version PR is merged, the workflow automatically publishes the new version to npm with the verified `--provenance` badge.

> **Authentication via npm Trusted Publishing**: This repository uses [npm Trusted Publishing](https://docs.npmjs.com/generating-provenance-statements) (OIDC) with cryptographic authentication between GitHub Actions and npm.

---

## License

All code in this repository is licensed under the [BSD-3-Clause](./LICENSE) license, matching standards used by the Rubin Observatory (LSST) and Astropy communities.
