#!/bin/sh

verbose="${VERBOSE:-0}"

if [ "$verbose" -gt '0' ]; then
	set -x
fi

set -e -f -u

cache_buster="${CACHE_BUSTER:-0}"
readonly cache_buster

release_base_url="${VERSION_DOWNLOAD_URL:?please set VERSION_DOWNLOAD_URL to the CYGUARD release directory}"
readonly release_base_url

while read -r arch snap_arch; do
	release_url="${release_base_url}/cyguard-linux-${arch}.tar.gz"
	output="./cyguard-linux-${arch}.tar.gz"

	if [ -n "$cache_buster" ]; then
		release_url="${release_url}?cache_buster=${cache_buster}"
	fi

	curl -o "$output" -v "$release_url"
	tar -f "$output" -v -x -z
	cp ./CYGUARD/cyguard "./cyguard_${snap_arch}"
	rm -f -r "$output" ./CYGUARD
done <<-'EOF'
	386   i386
	amd64 amd64
	armv7 armhf
	arm64 arm64
EOF
