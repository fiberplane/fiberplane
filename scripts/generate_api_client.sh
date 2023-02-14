#!/usr/bin/env bash

# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

DESCRIPTION="Generated API client for Fiberplane API"
REPO="https://github.com/fiberplane/fiberplane"
LICENSE="MIT OR Apache-2.0"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"

rm -rf "$SCRIPT_DIR/../fiberplane-api-client" || true

if [[ -d "$SCRIPT_DIR/../../fp-openapi-rust-gen/.git" ]]; then
  echo "using local checkout -- pulling latest main"

  pushd "$SCRIPT_DIR/../../fp-openapi-rust-gen"
    git switch main
    git pull
    cargo run -- \
      --output "$SCRIPT_DIR/../fiberplane-api-client" \
      "$SCRIPT_DIR/../schemas/openapi_v1.yml" \
      --license $LICENSE \
      --description "$DESCRIPTION" \
      --repository $REPO \
      --workspace
  popd
elif ! command -v fp-openapi-rust-gen &>/dev/null; then
  # not in path; use docker image
  docker run --rm --pull=always \
    -v "$(dirname $SCRIPT_DIR):/local" \
    -u "$(id -u ${USER}):$(id -g ${USER})" \
    fiberplane/fp-openapi-rust-gen:latest \
    --output /local/fiberplane-api-client \
    /local/schemas/openapi_v1.yml \
    --license $LICENSE \
    --description "$DESCRIPTION" \
    --workspace
else
  # use the one from PATH if its already there
  fp-openapi-rust-gen \
    --output fiberplane-api-client
    "$SCRIPT_DIR/../schemas/openapi_v1.yml"
    --license $LICENSE \
    --description "$DESCRIPTION" \
    --workspace
fi

cd "$SCRIPT_DIR/../fiberplane-api-client"
cargo fmt -p fiberplane-api-client

ln ../scripts/fiberplane-api-client-template/* .
