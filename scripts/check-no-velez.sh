#!/usr/bin/env bash
set -euo pipefail

# Show any matches to help devs fix them (non-fatal)
grep -RIn -i \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=build \
  --exclude-dir=.medusa \
  --exclude-dir=.git \
  --exclude-dir=apps/storefront/build \
  --exclude=*.md \
  --exclude-dir=docs \
  'velez' . || true

# Fail if any remain (excluding the allowed email domain)
if grep -RIn -i \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=build \
  --exclude-dir=.medusa \
  --exclude-dir=.git \
  --exclude-dir=apps/storefront/build \
  --exclude=*.md \
  --exclude-dir=docs \
  'velez' . | grep -vi 'chefluisvelez.com' > /dev/null; then
  echo "Found forbidden brand string 'Velez'. Please remove remaining references."
  exit 1
fi

