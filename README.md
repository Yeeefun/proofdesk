# ProofDesk — A Brake for Overconfident Claims

[Live English demo](https://proofdesk-readonly-20261002.yeefuntec-7175.chatgpt.site/en/) · [中文演示](https://proofdesk-readonly-20261002.yeefuntec-7175.chatgpt.site/)

An Astro + Sanity scope-review prototype linking claims, evidence and review decisions. The fictional example narrows an overbroad claim to verified UTF-8 CSV support; withdrawing its evidence puts the claim back under review while retaining history. The public demo is read-only, with no write token or paid model API.

## Source and documentation

The complete MIT v4 source is in **[public-release-v4/](public-release-v4/)**.

- [Architecture, judge path, local setup and verification limits](public-release-v4/README.md)
- [中文说明](public-release-v4/README.zh-CN.md)
- [MIT license](public-release-v4/LICENSE)

The source lives in a subdirectory. After cloning, run all setup/build commands from `public-release-v4`, not the repository root:

```sh
git clone https://github.com/Yeeefun/proofdesk.git
cd proofdesk/public-release-v4
npx --yes pnpm@11.19.0 install --frozen-lockfile
```

Then follow the source README for the build, read-only local server and tests. Node 24+ is required; `.node-version` records the tested 24.19.0 version.

Sanity project: `w6fg4266`; public dataset: `production`, containing fictional material only. Do not run historical write scripts on the shared demo dataset. The public view is not a general fact checker, authenticated approval service or tamper-proof audit log.

The six production runtime/configuration files match deployed version 2; public packaging documents and helper files differ. Publishing this source does not redeploy the live Site or itself submit a contest entry.
