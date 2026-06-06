# Publishing

The npm packages are published under the `@prettui` scope:

- `@prettui/core`
- `@prettui/components`
- `@prettui/dashboard`
- `@prettui/framework`
- `@prettui/layouts`
- `@prettui/demo`
- `@prettui/cli`
- `@prettui/kit`

## First Manual Publish

Use this path when the packages do not exist on npm yet or before npm Trusted
Publishing is configured.

```bash
npm whoami
pnpm install
pnpm run quality
pnpm run release:publish:npm:dry-run
pnpm run release:publish:npm:manual
```

The manual publish command uses `npm publish --access public` and skips
`--provenance`, because provenance is issued by supported CI providers. If your
npm account requires two-factor auth, npm will prompt for the OTP.

The `@prettui` npm scope must already exist and the logged-in npm user must have
write access to it.

## CI Publishing

After the first package pages exist, configure npm Trusted Publishing for each
`@prettui/*` package:

- Provider: GitHub Actions
- Owner: `reachjalil`
- Repository: `prettui`
- Workflow file: `release.yml`
- Environment: leave blank unless you add a matching GitHub environment

Then publish from GitHub by tagging the validated `main` commit:

```bash
git checkout main
git pull --ff-only origin main
git tag -a v0.1.0 -m "v0.1.0"
git push origin v0.1.0
```

The release workflow verifies the tag, runs `pnpm run quality`, publishes
packages that do not already exist on npm, and creates or updates the GitHub
release notes.
