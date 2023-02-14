#!/usr/bin/env bash

# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

DESCRIPTION="Generated API client for Fiberplane API"
REPO="https://github.com/fiberplane/fiberplane"
LICENSE="MIT OR Apache-2.0"
README="README.md"

# https://stackoverflow.com/a/23930212/11494565
read -r -d '' MODELS << EOM
fiberplane_models::notebooks::*;
fiberplane_models::notebooks::operations::*;
fiberplane_models::blobs::*;
fiberplane_models::comments::*;
fiberplane_models::data_sources::*;
fiberplane_models::events::*;
fiberplane_models::files::*;
fiberplane_models::formatting::*;
fiberplane_models::labels::*;
fiberplane_models::names::*;
fiberplane_models::proxies::*;
fiberplane_models::query_data::*;
fiberplane_models::realtime::*;
fiberplane_models::snippets::*;
fiberplane_models::sorting::*;
fiberplane_models::templates::*;
fiberplane_models::timestamps::*;
fiberplane_models::tokens::*;
fiberplane_models::users::*;
fiberplane_models::views::*;
fiberplane_models::workspaces::*
EOM

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
      --readme $README \
      --models "$MODELS" \
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
    --repository $REPO \
    --readme $README \
    --models "$MODELS" \
    --workspace
else
  # use the one from PATH if its already there
  fp-openapi-rust-gen \
    --output fiberplane-api-client
    "$SCRIPT_DIR/../schemas/openapi_v1.yml"
    --license $LICENSE \
    --description "$DESCRIPTION" \
    --repository $REPO \
    --readme $README \
    --models "$MODELS" \
    --workspace
fi

cd "$SCRIPT_DIR/../fiberplane-api-client"
cargo fmt -p fiberplane-api-client

ln ../scripts/fiberplane-api-client-template/* .
