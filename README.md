# SkyScout Monorepo

Welcome to **SkyScout**, the base of operations for open-source astrophysics software, alert broker clients, and telescope discovery tools designed to follow and filter discoveries from wide-field surveys—including the **Vera C. Rubin Observatory (LSST)** and the **Nancy Grace Roman Space Telescope**.

---

## Workspace Structure

This repository is organized as a lightweight Turborepo + npm workspaces monorepo:

```text
skyscout/
├── .changeset/               # Multi-package release and versioning configuration
├── .github/
│   └── workflows/
│       ├── ci.yml            # Fast, single-runner GitHub Actions CI
│       └── release.yml       # Automated npm publishing with provenance via Changesets
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

## Packages

| Package | Version | Description |
| :--- | :--- | :--- |
| [`@skyscout/core`](./packages/core) | `0.1.0` | Shared astronomical mathematics, time transformations, coordinate geometry, and photometry math |
| [`@skyscout/lasair-client`](./packages/lasair-client) | `0.1.0` | Zero-dependency, fully-typed TypeScript client for the Lasair Rubin alert broker |

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

# Build all packages into ESM + CommonJS distribution bundles
npm run build
```

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
When PRs containing changesets are merged into `main`:
1. The **Release** workflow automatically opens a *"chore: version packages"* Pull Request bumping versions and generating `CHANGELOG.md`.
2. When that Version PR is merged, the workflow automatically publishes the new version to npm with the verified `--provenance` badge.

> **Required GitHub Secret**: Set `NPM_TOKEN` in your GitHub repository's **Settings > Secrets and variables > Actions** with an automation/publish token from [npmjs.com](https://www.npmjs.com/).

---

## License

All code in this repository is licensed under the [BSD-3-Clause](./LICENSE) license, matching standards used by the Rubin Observatory (LSST) and Astropy communities.
