# CYGUARD architecture and release boundary

## Architecture

- `main.go` and `internal/home/` own process startup, service control, and the
  current HTTP API.
- `internal/dnsforward/`, `internal/filtering/`, `internal/querylog/`, and
  `internal/stats/` provide the DNS, policy, activity, and statistics engine.
- `client_v2/` is the active SolidJS administration interface embedded from
  `build/static/`.
- `openapi/` defines the compatibility-sensitive REST contract.
- `scripts/make/` and `docker/` build native and container artifacts.
- `internal/ossvc/` implements platform service integration.

## Branding classification

| Category | Policy |
| --- | --- |
| Product UI, titles, setup, login, CLI | CYGUARD |
| Service display name and description | CYGUARD |
| Release filenames and executable name | `cyguard` |
| REST paths and JSON/YAML fields | Preserved |
| Go imports and module paths | Preserved |
| Existing `AdGuardHome.yaml` | Preserved |
| Internal service identifier | Preserved for installed-service upgrades |
| Third-party data and filter names | Preserved |
| Licenses, notices, and history | Preserved |

## Real-data contract

Dashboard cards, activity tables, reports, protection states, device data, and
diagnostics are rendered from existing `/control` responses.  Empty, disabled,
and unavailable states must remain explicit.  Decorative sample threats,
scans, security scores, or AI conclusions are prohibited.

## Windows release resources

The canonical metadata is `build/windows/versioninfo.json`; the executable
manifest is `build/windows/cyguard.exe.manifest`; and the multi-resolution icon
is `client_v2/public/assets/favicon.ico`.  A Windows release job must compile
these resources into its architecture-specific `.syso` input before building.

Release acceptance requires inspection of the generated `cyguard.exe` for:

- filename and seven-size shield icon;
- Product Name `CYGUARD`;
- File Description `CYGUARD - Cybersecurity & Privacy Protection`;
- Internal Name `cyguard` and Original Filename `cyguard.exe`;
- actual build version and CYGUARD CLI output;
- service install, start, stop, restart, status, and uninstall behavior.

Source metadata alone is not executable verification.
