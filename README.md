# CYGUARD

**Cybersecurity & Privacy Protection**

CYGUARD 2.0 is a self-hosted network security and privacy platform.  It uses
DNS-level enforcement to block unwanted domains, apply per-device policies,
provide encrypted DNS, and show real network activity without inserting fake
security scores or simulated threat data.

The product is built on the proven AdGuard Home DNS engine.  CYGUARD preserves
its API, configuration schema, network behavior, and required open-source
notices while providing an independent product identity and interface.

## Capabilities

- DNS request processing, caching, rewrites, bootstrap, fallback, and custom
  upstreams.
- Blocklists, allowlists, custom filtering rules, safe search, and supported
  browsing-security filters.
- Query activity, request statistics, top domains, top devices, and upstream
  performance sourced from the running server.
- Per-device policies, access control, DHCP, authentication, and HTTPS.
- DNS-over-HTTPS, DNS-over-TLS, DNS-over-QUIC, and encrypted upstream support.
- Responsive administration for desktop, tablet, mobile, and installable PWA
  contexts.

Feature availability depends on the operating system and server
configuration.  CYGUARD reports unavailable or disabled states directly; it
does not synthesize scan results or telemetry.

## Quick start from source

Prerequisites are Go 1.25 or newer, Node.js 24.10 or newer, npm 10.8 or newer,
GNU Make, and a POSIX-compatible shell.  The upstream build currently selects
its exact Go toolchain through the Makefile.

```sh
git clone <your-cyguard-repository-url> cyguard
cd cyguard
make init
make
./cyguard
```

Open the address printed by CYGUARD and complete the first-run wizard.  The
existing `AdGuardHome.yaml` configuration filename is intentionally retained
for compatibility with established installations and automation.

## Development

The current web client is in `client_v2/`.  It is a SolidJS application backed
only by the real `/control` API.

```sh
cd client_v2
npm ci
npm run check
npm run build-prod
```

Backend verification uses the root Makefile:

```sh
make go-test
make go-build
```

The default development executable is named `cyguard`; release archives use
`cyguard-<os>-<architecture>` names.  See `doc/CYGUARD_ARCHITECTURE.md` for the
compatibility boundaries and release checks.

## Docker

Build release payloads and a local image from this source tree:

```sh
make SIGN=0 build-release build-docker
```

Existing configuration and data mount paths remain compatible.  No public
CYGUARD registry image is claimed by this repository.

## Installer

The installer intentionally requires the release location owned by the
distributor; this repository does not claim a public CYGUARD download host.

```sh
CYGUARD_RELEASE_BASE_URL=https://downloads.example/cyguard/release \
CYGUARD_INSTALL_SCRIPT_URL=https://downloads.example/cyguard/install.sh \
sh ./scripts/install.sh
```

`CYGUARD_INSTALL_SCRIPT_URL` is only needed if the script must download and
relaunch itself through `sudo`.  Archives at the release base URL must use the
names produced by `make build-release`.

## CLI

```text
cyguard --help
cyguard --version
cyguard -s install|uninstall|start|stop|restart|status
```

The service display name is **CYGUARD**.  Its compatibility-sensitive internal
identifier, configuration keys, and existing configuration filename remain
unchanged.

## API and compatibility

The existing REST endpoints under `/control` are retained.  The authoritative
OpenAPI specification remains in `openapi/openapi.yaml`.  Internal Go module
paths, API field names, configuration keys, and bundled third-party data are
not renamed merely for branding.

## Privacy and security

CYGUARD adds no analytics, tracking pixels, hidden telemetry, external control
plane, or hardcoded credentials.  Authentication, session, CSRF, HTTPS, input
validation, and authorization behavior remain in the underlying server.

## License and attribution

CYGUARD is distributed under the GNU General Public License v3.0.  The full
license is in [LICENSE.txt](LICENSE.txt).

This project is a branded derivative of
[AdGuard Home](https://github.com/AdguardTeam/AdGuardHome).  AdGuard names,
third-party marks, copyright notices, historical records, dependencies, and
license notices remain the property of their respective owners.  See
[ATTRIBUTION.md](doc/ATTRIBUTION.md) for the separation between CYGUARD product
branding and compatibility-sensitive upstream identifiers.
