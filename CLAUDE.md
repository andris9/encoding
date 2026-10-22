# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm test                  # run the suite (node --test test/test.js)
npm run test:coverage     # same, under c8
npm run test:cjs          # the suite with require(esm) disabled (CommonJS guard)
npm run lint              # eslint .
npm run lint:fix          # eslint . --fix
npm run format            # prettier --write .
npm run format:check      # prettier --check .
npm run update            # rm -rf node_modules package-lock.json && ncu -u && npm install
```

Run a single test by name with Node's built-in runner:

```bash
node --test --test-name-pattern="From Latin_1 to UTF-8" test/test.js
```

## Architecture

The whole package is `lib/encoding.js`, a thin wrapper around [iconv-lite](https://github.com/ashtuchkin/iconv-lite) that exports one function, `convert(str, to, from = 'UTF-8')`, which always returns a Buffer.

- `checkEncoding()` normalizes charset aliases before they reach iconv-lite (`latin1` -> `ISO-8859-1`, `win1252` -> `WINDOWS-1252`, `utf8` -> `UTF-8`, `ks_c_5601-1987` -> `CP949`, `us-ascii` -> `ASCII`) and upper-cases the result.
- A string input with a non-UTF-8 source charset is read as a `binary` (latin1) Buffer first.
- Same source and target charset is a no-op apart from turning a string into a Buffer.
- A conversion error is logged with `console.error` and the input is returned unchanged (as a Buffer). Callers depend on `convert()` never throwing, so do not change that.

Tests live in `test/test.js` and use `node:test` with `node:assert/strict`.

## Platform constraints

EmailEngine pulls this package in through gettext-parser and ships as a standalone binary built with `@yao-pkg/pkg`. That binary snapshots a CommonJS module graph and cannot load ES modules, and EmailEngine supports Node 20 and later. Two rules follow:

- **Node.js 20 is the supported minimum.** Tests and tooling must work on Node 20, 22 and 24 (the CI matrix), and the runtime code must never need more than Node 20. This is not stated in `package.json`: there is deliberately no `engines` field (see below), and in practice `lib/` stays far more conservative than Node 20 because older consumers still install it.
- **Everything that reaches runtime must be genuinely CommonJS.** Do not convert to ESM. `require()` of this package and of `iconv-lite` must work with `--no-experimental-require-module`: Node 22+ (and 20.19) load ESM through `require()` by default, which would hide an ESM-only dependency until the pkg binary fails. A CJS wrapper around a dynamic `import()` does not count. Never upgrade to an ESM-only dependency; pin the last CommonJS line in `.ncurc.js` (`reject` or `target`) with a comment giving the reason, as is already done for `iconv-lite`.

Check with `npm run test:cjs`, which runs the suite under `NODE_OPTIONS=--no-experimental-require-module`. CI runs it on Node 22.x and 24.x, the versions where require(esm) is on by default.

## Critical constraints

- **Nothing here may change what consumers get without a deliberate decision.** This package has millions of weekly downloads, mostly as a transitive dependency (node-fetch v2 optional peer, gettext-parser, which is how EmailEngine pulls it in, and many more), and a lot of those consumers run very old Node versions. The repo tooling (eslint, prettier, c8, the CI matrix on Node 20/22/24) is development-only.
    - There is deliberately **no `engines` field**. Do not add one: it would change installs for every consumer.
    - The `files` list publishes only `lib/` (plus README, LICENSE and package.json, which npm always includes). Keep every runtime file under `lib/`.
    - `lib/encoding.js` keeps its original style (`var`, escaped `-` in regexes). `eslint.config.js` turns `no-var` and `no-useless-escape` off for `lib/` so the shipped file is not rewritten for style.
    - Do not add dependencies.
    - `iconv-lite` is held on 0.6.x by `.ncurc.js` (`target: 'patch'`). Moving to 0.7 or 1.x changes every consumer's install and must be its own reviewed change.
- **Releases go through release-please**, as in the other Postal Systems packages: `release-please-config.json` (manifest mode, plain `vX.Y.Z` tags) and `.github/workflows/release.yaml`, which publishes to npm through trusted publishing (OIDC, no token secret; the trusted publisher on npmjs.com names this repository and `release.yaml`, so the workflow file must keep that name). A `fix:` or `feat:` commit on master opens or updates the release PR, and merging it tags and publishes. Never bump the version in `package.json` or run `npm publish` by hand. Because every release reaches millions of installs, a runtime change still needs the deliberate decision described above before it is committed.

## Conventions

These mirror the conventions used across Postal Systems projects (see `../emailengine`).

**Git commits**

- Use Conventional Commits, and keep the prefixes honest, since release-please turns `fix:` and `feat:` into a release: those only for runtime changes, `chore:`/`build:`/`ci:`/`docs:`/`style:`/`test:` for everything else.
- Do **not** list Claude or any AI assistant as a co-author or co-contributor in commit messages or PR descriptions (no `Co-Authored-By` trailer).
- Append `[skip ci]` to commits that do not change runtime behavior (docs, comments, formatting) to avoid spending CI minutes. Never add it to a `fix:` or `feat:` commit, and never quote the marker literally in a commit message body, since GitHub matches it anywhere in the message.

**Code and docs style**

- No emojis anywhere in code or documentation, printable ASCII only.
- Use a single hyphen-minus (`-`) as a dash. Never use double hyphens, em dashes, or en dashes.

**Before committing code changes**

1. `npm run format` and `npm run lint`
2. `npm test`
3. For non-trivial changes, consider `/simplify` and `/security-review`.

**After pushing**

- Check the workflow runs for the push (`gh run list --branch <branch>`) and report their status. If a run fails for an infrastructure reason (HTTP 403, "account suspended" on checkout), check <https://www.githubstatus.com/> before assuming the change caused it.
