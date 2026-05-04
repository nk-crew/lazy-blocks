# AGENTS

Guidance for automated coding agents. **Do not mirror long-form docs here**—use [lazyblocks.com/docs](https://www.lazyblocks.com/docs/overview/) for product behavior and APIs.

## Product

WordPress plugin: visual block builder for Gutenberg; blocks stored as CPT; PHP render + editor UI in React.

## Stack

- PHP (8+), WordPress Coding Standards
- Editor UI: React, `@wordpress/scripts`, SCSS
- `build/` is generated—edit sources under `assets/`, `controls/`, `classes/`

## Where to work

| Area | Location |
|------|----------|
| Block registration, CPT | `classes/` |
| Control types | `controls/<type>/` |
| Editor / builder UI | `assets/` |
| Hooks reference | filter names in code / docs site |

## Rules

- Prefer minimal diffs; follow existing patterns and naming.
- WordPress: sanitize/escape, nonces, capability checks for privileged actions.
- Run linters/tests relevant to your change (`npm run lint:*`, `composer`/PHPUnit/E2E per task)—see `package.json`.
- Do not commit secrets, production credentials, or destructive DB/env operations unless the user explicitly asks.

## Commands

Scripts are defined in `package.json` (e.g. `npm run build`, `npm run dev`, `npm run test:e2e`). Use those names; do not invent scripts.
