# Release checklist

Use this checklist before publishing `@prettui/*`, creating a GitHub release, or
announcing a new release. Record command output or a short evidence note in the
release pull request or release issue.

## Release scope

- [ ] Release version, npm dist-tag, and target git ref are confirmed.
- [ ] Root and scoped package versions are updated consistently.
- [ ] The release branch contains only intentional release changes.
- [ ] The release pull request targets `main` from `dev`.
- [ ] Maintainer self-review and Codex review notes are linked when behavior,
      release automation, or security posture changed.

## Required gates

- [ ] Quality gate passes: `pnpm run quality`.
- [ ] npm dry-run is validated: `pnpm run publish:dry-run`.
- [ ] Demo smoke checks pass:
      `pnpm --filter @prettui/cli exec node dist/bin.js demo --snapshot --no-color`.
- [ ] Package contents are inspected for `dist`, README, license, notice,
      security policy, and executable bin.
- [ ] `docs/RELEASE_NOTES.md` is updated with user-visible changes.

## Final publish check

- [ ] The git tag uses `vX.Y.Z` or `vX.Y.Z-prerelease` and points at the
      validated `main` commit.
- [ ] `pnpm run release:verify` passes.
- [ ] Published scoped package versions match the tag and release notes.
- [ ] Post-publish install smoke check passes with the published package.
