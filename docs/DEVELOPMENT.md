# Development And Release Process

This repository uses a `dev` to `main` release lane.

## Branches

- `dev` is the default development branch.
- Feature, fix, docs, and dependency branches start from `dev` and merge back
  to `dev` through pull requests.
- `main` is protected and release-only. It receives release pull requests from
  `dev`, not day-to-day feature work.

## Required Gates

CI runs `pnpm run quality`, which includes linting, type checks, tests, build,
and npm pack dry runs. Release publishing runs the same gate again from the tag
before publishing.

## Public API Rules

- Keep components as pure render functions: props in, string frame out.
- Export prop types for reusable components and layouts.
- Keep runtime dependencies at zero unless a concrete capability requires one.
- Preserve exact frame dimensions in tests for every layout-level change.
- Keep public demo fixtures neutral and free of private product names.

## Release Flow

All publishable metadata uses the same version:

- root package metadata;
- `packages/pretuiy/package.json`.

Release steps:

1. Prepare a release pull request from `dev` to `main`.
2. Update versions together.
3. Update `docs/RELEASE_NOTES.md` and complete `RELEASE-CHECKLIST.md`.
4. Merge the release pull request to `main` after CI passes.
5. Tag the exact `main` merge commit:

   ```bash
   git checkout main
   git pull --ff-only origin main
   git tag -a v0.1.0 -m "v0.1.0"
   git push origin v0.1.0
   ```

6. The release workflow verifies the tag, runs quality, publishes npm through
   trusted publishing, and creates the GitHub release.
