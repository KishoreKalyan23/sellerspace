#!/bin/sh
set -e

if [ -n "$API_BASE_URL" ]; then
  CONFIG_FILE="/app/dist/vendor-portal/browser/app-config.json"
  printf '{"apiBaseUrl":"%s"}' "$API_BASE_URL" > "$CONFIG_FILE"
fi

exec "$@"
