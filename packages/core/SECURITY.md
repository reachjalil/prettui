# Security Policy

prettui renders terminal UI frames and ships a CLI demo. Treat terminal escape
handling, package publishing, and executable behavior as security-sensitive.

## Supported Versions

Security reports are accepted for the current published `@prettui/*` packages.

## Reporting

Please report suspected vulnerabilities privately through GitHub Security
Advisories:

https://github.com/reachjalil/prettui/security/advisories/new

For non-sensitive bugs, use GitHub issues:

https://github.com/reachjalil/prettui/issues

## Security Scope

Relevant reports include:

- unsafe terminal escape handling,
- package publishing or binary execution concerns,
- denial-of-service behavior from malformed render inputs,
- dependency or supply-chain issues in release tooling.
