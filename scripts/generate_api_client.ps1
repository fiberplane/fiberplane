# Windows version of the `generate_api_client.sh` script

$LICENSE="MIT OR Apache-2.0"
$DESCRIPTION="Generated API client for Fiberplane API"
$REPO="https://github.com/fiberplane/fiberplane"
$README="README.md"

$MODELS=("fiberplane_models::notebooks::*;
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
fiberplane_models::workspaces::*")

$start_dir = Get-Location;
$script_path = ($PSScriptRoot);
$script_dir = (Get-Item $script_path).FullName;
$root_dir = (Get-Item $script_path).parent.FullName;
$api_client_dir = Join-Path $root_dir "fiberplane-api-client";

if (Test-Path $api_client_dir)
{
    Remove-Item $api_client_dir -Recurse
}

$api_generator_dir = Join-Path (Get-Item $root_dir).Parent.FullName "fp-openapi-rust-gen";

if (Test-Path (Join-Path $api_generator_dir ".git")) {
    Write-Host "using local checkout -- pulling latest main"

    pushd "${root_dir}\..\fp-openapi-rust-gen"
      git switch main
      git pull --rebase --autostash
      cargo run -- `
        --output $api_client_dir `
        "${root_dir}\schemas\openapi_v1.yml" `
        --license $LICENSE `
        --description $DESCRIPTION `
        --repository $REPO `
        --readme $README `
        --models $MODELS `
        --workspace
    popd
}
elseif ($null -eq (Get-Command "fp-openapi-rust-gen.exe" -ErrorAction SilentlyContinue))
{
    # not in path; use docker image
    Write-Host "pulling newest docker image for our openapi generator and running it"
    Write-Host "if this fails, please ensure you have executed 'docker login' with the 'fiberplane' account (creds in 1password)"

    docker.exe run --rm --pull=always `
        -v "${root_dir}:/local" `
            fiberplane/fp-openapi-rust-gen:latest `
            --output /local/fiberplane-api-client `
            /local/schemas/openapi_v1.yml `
            --license $LICENSE `
            --description $DESCRIPTION `
            --repository $REPO `
            --readme $README `
            --models $MODELS `
            --workspace
}
else
{
    # use the one from PATH if its already there
    fp-openapi-rust-gen.exe `
      --output $api_client_dir `
      .\schemas\openapi_v1.yml `
      --license $LICENSE `
      --description $DESCRIPTION `
      --repository $REPO `
      --readme $README `
      --models $MODELS `
      --workspace
}

Set-Location $api_client_dir
cargo fmt -p fiberplane-api-client

$template_path = Join-Path $script_dir "fiberplane-api-client-template"
cmd /c mklink "$api_client_dir\README.md" "$template_path\README.md"

# go back to the beginning so our user doesn't get confused as they're in a different directory now
Set-Location $start_dir
