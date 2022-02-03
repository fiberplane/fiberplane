#!/bin/bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

docker run --rm \
    -v "$(dirname $SCRIPT_DIR):/local" \
    -u "$(id -u ${USER}):$(id -g ${USER})" \
    openapitools/openapi-generator-cli:v5.2.1 \
        generate \
            -i /local/schemas/openapi_v1.yml \
            -p packageName=fp-api-client \
            -g rust \
            -o /local/api_client \
            --skip-validate-spec