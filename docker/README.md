# CYGUARD container build

Build CYGUARD release payloads and the local image with the existing pipeline:

```sh
make SIGN=0 build-release build-docker
```

The DNS, web, DHCP, and encrypted-DNS ports are unchanged.  Existing data and
configuration mount paths remain compatible with upstream installations.  The
container starts the CYGUARD executable and must use real server data; no
external telemetry or dashboard service is introduced.
