# ProofDesk — A Brake for Overconfident Claims

[Live read-only demo](https://proofdesk-readonly-20261002.yeefuntec-7175.chatgpt.site/en/) · [中文说明](README.zh-CN.md) · [MIT License](LICENSE)

A small Astro + Sanity prototype showing why a claim needs review after its
supporting evidence is withdrawn. All claims, evidence and CSV examples are
fictional. This is a scope-review demonstration, not a general fact checker.

## Deployed architecture

Astro builds two static language shells from `site-src`. A read-only Worker reads
the published Sanity dataset without a token and applies the same
`validateState`, `currentClaim` and `assess` functions. The browser fetches
`/api/state`; it does not write records. All non-GET/HEAD methods are rejected
with 403. `/api/action` also returns 403. A cloud read failure returns 503 and no
fixture state. The downloadable CSV is explicitly fictional source material,
not a substitute for a failed cloud response.

Public selectors: project `w6fg4266`, dataset `production`, API `2026-03-01`.
Do not supply a write token. The language switch translates labels and known
fictional examples for display; Chinese originals remain available and the
underlying records do not change. Unknown text remains in its original language.
No model, translation API, payment or runtime write service is required.

Judge path: open `/en/`, read **Current claim** and **Needs review**, inspect the
withdrawn evidence, and expand **Claim versions and review history**. The broad
original claim, narrower claim, prior approval and withdrawal remain. Chinese
is available at `/`. Version 2 redirects the old `/?lang=en` entry to `/en/`.
On version 1, an HTTP language check had passed while the browser displayed
Chinese; that earlier conclusion was corrected by actual browser inspection.

## Run this public source locally

Use Node 24+ and pnpm 11.19.0. Dependency versions and the lockfile are unchanged.
Tested with Node 24.19.0 and the project's existing dependencies; a fresh
dependency download on another machine has not been tested in this handoff.

```sh
npx --yes pnpm@11.19.0 install --frozen-lockfile
ASTRO_TELEMETRY_DISABLED=1 npm run build
npm start
```

PowerShell build equivalent:

```powershell
$env:ASTRO_TELEMETRY_DISABLED='1'
npm run build
npm start
```

Open `http://127.0.0.1:4321/en/` or `/`. `npm run dev` performs the same
build/start sequence; it is a read-only preview, without hot reload. `PORT` can
change the local port. Binding is always `127.0.0.1`; `HOST` cannot expose this
helper to a network. This helper is not the production hosting entry.

`scripts/build-worker.mjs` copies the production Worker and converts only the
core's Node `randomUUID` import to Web Crypto in the build output. The Node
bridge in `scripts/serve-readonly.mjs` imports that built Worker and serves only
files contained in `dist/client`, including real-path checks for symlinks.
It loads no `.env` and forwards only the three public Sanity selectors above,
never `SANITY_API_TOKEN`. It cannot perform local or cloud writes.

```sh
npm run test:readonly
node scripts/public-read-once.mjs
```

The first command needs a build. It checks the real loopback HTTP bridge with
mock upstream records: bilingual routes, HEAD, writes, traversal/symlink escape,
and failure/no-fallback behavior. Mock results are not live cloud verification.
The second command makes a separate tokenless public read and reports counts.
The old rule/readback tests remain in `test` and were not rerun for this release.

## Provenance and verification limits

This source handoff corresponds to production version 2, commit
`988546fd0207656a9493041ac394c0b1dc5909ee`, correcting version 1's language navigation.
Production core files are preserved byte-for-byte. README, package scripts,
public build helper and the new loopback helper/tests differ; obsolete
Node/Render setup and account-specific deployment identity were removed.
**The complete v4 archive is not identical to a deployment source commit.**
Its clean file hashes and exact changes are supplied in the release manifest.

The earlier operator verified two claim versions, one evidence document, two
review decisions, `needs_review`, and POST 403. These reflect real historical
seed/approve/withdraw transactions on fictional records. Local failure
simulation returned 503 with no fallback. HTTP checks alone do not establish
browser/phone language or visual behavior; the version 1 query-language claim
was corrected after browser inspection. The responsible operator reports version
2 browser navigation, original-record disclosure and 390px Chinese/English
screenshots checked without horizontal overflow. This packaging stage independently
checks local HTTP behavior, not a second production browser review. Later live reads can change; follow
the dated release acceptance record.

The GitHub repository `Yeeefun/proofdesk` was still empty when preparation began.
This package does not claim that its source was uploaded. The live Site is
published; public GitHub source, contest submission, eligibility and any award
remain separate steps. No revenue or payment is claimed.

## Historical code and boundaries

`src/pages`, repository adapters, `scripts/cloud.mjs`, `scripts/demo-reset.mjs`
and Sanity seed/schema files preserve earlier private reproduction work. They
are not compiled by this static `site-src` build, and their writable CLI/local
paths are **not public UI capabilities**. Do not run seed/approve/withdraw on
the shared public dataset. This release includes no write credentials and
documents only the read-only local preview. Actor labels are not authentication;
append-only operations are not an immutable audit-log guarantee.

MIT copyright 2026 ProofDesk contributors. Dependencies retain their licenses.
`private: true` prevents accidental npm registry publication, not GitHub access.
The source contains no installed dependencies, environment secrets, Git history,
build cache or deployment-account identity. Building this copy does not create
or update the existing Site. No Render deployment is claimed.
