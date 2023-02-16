#!/usr/bin/env python3

import argparse
import subprocess
import sys
from typing import List
import json
from pathlib import Path

# Using urllib instead of requests to _only_ require
# Python 3 stdlib to work
import urllib.request


ALL_CRATES_PATHS_IN_ORDER = [
    ("base64uuid", "base64uuid"),
    ("fiberplane-models", "fiberplane-models"),
    ("fiberplane-api-client", "fiberplane-api-client"),
    ("fiberplane-markdown", "fiberplane-markdown"),
    (
        "fiberplane-provider-bindings",
        "fiberplane-provider-protocol/fiberplane-provider-bindings",
    ),
    (
        "fiberplane-provider-runtime",
        "fiberplane-provider-protocol/fiberplane-provider-runtime",
    ),
    ("fiberplane-templates", "fiberplane-templates"),
    ("fiberplane", "fiberplane"),
]
ALL_CRATES = "all"
CRATES_IO = "crates-io"


def install_dependencies():
    """
    Install dependencies for the script

    """
    check_cargo_edit = subprocess.run("which cargo-set-version", shell=True)
    if check_cargo_edit.returncode != 0:
        print(f"Installing cargo-edit...", end=" ")
        try:
            subprocess.check_output(
                f"cargo install --locked cargo-edit",
                stderr=subprocess.STDOUT,
                shell=True,
            )
        except subprocess.CalledProcessError as e:
            print(f"Error during installation:\n{e.output}")
            sys.exit(1)
        print("OK!")

    check_dasel = subprocess.run("which dasel", shell=True)
    if check_dasel.returncode != 0:
        print(f"Installing dasel...", end=" ")
        try:
            dasel_url = "https://github.com/TomWright/dasel/releases/download/v2.1.1/dasel_linux_amd64"
            request = urllib.request.Request(
                dasel_url, headers={"User-Agent": "Fiberplane/Release worker/1.0"}
            )
            with urllib.request.urlopen(request) as response:
                dasel_path = Path.home() / ".local" / "bin" / "dasel"
                with open(dasel_path, "w") as f:
                    f.write(response.read())
            subprocess.check_output(
                f"chmod a+x {dasel_path}",
                stderr=subprocess.STDOUT,
                shell=True,
            )
        except Exception as e:
            print(f"Error during installation:\n{e}")
            sys.exit(1)
        print("OK!")


def index_url_path(crate: str) -> str:
    if len(crate) == 1:
        return f"1/{crate}"
    elif len(crate) == 2:
        return f"2/{crate}"
    elif len(crate) == 3:
        return f"3/{crate[0]}/{crate}"
    else:
        return f"{crate[0:2]}/{crate[2:4]}/{crate}"


def crates_io_published_versions(crate: str) -> List[str]:
    """
    Fetches the current list of all published versions of a crate on crates-io.

    Notably, this _includes_ the yanked versions
    """
    index_url = f"https://index.crates.io/{index_url_path(crate)}"
    print(f"Requesting {index_url}")
    request = urllib.request.Request(
        index_url, headers={"User-Agent": "Fiberplane/Release worker/1.0"}
    )
    with urllib.request.urlopen(request) as response:
        # We ignore anything that comes after the first newline
        data = json.loads(response.read().decode("utf-8").split("\n", 1)[0])
        # The response can be either a single json object or an array of json object
        if isinstance(data, dict):
            return [data["vers"]]
        else:
            return [published["vers"] for published in data]


def publish(crate: str, version: str, registry: str):
    """
    Publish a crate on crates-io.

    You must be already logged in in order to have this function working.
    """
    print(f"Publishing {crate} crate on {registry} in version {version}...", end=" ")
    try:
        allow_dirty = "--allow-dirty" if registry != CRATES_IO else ""
        subprocess.check_output(
            f"cargo publish --registry {registry} -p {crate} {allow_dirty}",
            stderr=subprocess.STDOUT,
            shell=True,
        )
    except subprocess.CalledProcessError as e:
        print(f"Error during publication:\n{e.output}")
        sys.exit(1)
    print("OK!")


def git_based_crate_version() -> str:
    """
    Return a valid crate version usable for artifactory, based on git commit information.

    Most of the time it's meant to transform a description like
    'v1.0.0-alpha.2-7-gcba255f' into a suitable Semver Version like
    '1.0.0-alpha.2.7.gcba255f'
    """
    try:
        git_describe = subprocess.check_output(
            "git describe --tags",
            stderr=subprocess.STDOUT,
            shell=True,
        ).decode(encoding="utf-8")
        git_describe = git_describe.lstrip("v")
        git_describe = git_describe.rstrip("\n\t\r ")

        # Replacing all '-' but the first with '.'
        elements = git_describe.split("-", maxsplit=1)
        if len(elements) == 1:
            return elements[0]

        header = elements[0]
        tail = elements[1].replace("-", ".")
        return f"{header}-{tail}"
    except subprocess.CalledProcessError as e:
        print(f"Error fetching git version:\n{e.output}")
        sys.exit(1)


def set_cargo_manifests_git_version(registry: str):
    """
    Set the versions of all crates in the repo as git versions
    """

    def set_version(crate: str, crate_dir: Path, version: str):
        print(f"Setting version of {crate} to {version}...", end=" ")
        try:
            # We can't use 'cargo set-version' from cargo-edit crate because
            # it refuses to downgrade packages (the version numbers don't really match anything
            # between crates-io and the artifactory)
            subprocess.check_output(
                f'dasel put -f Cargo.toml -s ".package.version" -v "={version}"',
                cwd=crate_dir,
                stderr=subprocess.STDOUT,
                shell=True,
            )
        except subprocess.CalledProcessError as e:
            print(f"Error setting version:\n{e.output}")
            sys.exit(1)
        print("OK!")

    def edit_root_dependencies(version: str, registry: str):
        print(
            f"Setting versions of all crates to {version} in root Cargo.toml...",
            end=" ",
        )
        try:
            for pair in ALL_CRATES_PATHS_IN_ORDER:
                crate = pair[0]
                subprocess.check_output(
                    f'dasel put -f Cargo.toml -s ".workspace.dependencies.{crate}.version" -v "={version}"',
                    stderr=subprocess.STDOUT,
                    shell=True,
                )
                subprocess.check_output(
                    f'dasel put -f Cargo.toml -s ".workspace.dependencies.{crate}.registry" -v "{registry}"',
                    stderr=subprocess.STDOUT,
                    shell=True,
                )
        except subprocess.CalledProcessError as e:
            print(f"Error setting version:\n{e.output}")
            sys.exit(1)
        print("OK!")

    git_version = git_based_crate_version()
    edit_root_dependencies(git_version, registry)
    for pair in ALL_CRATES_PATHS_IN_ORDER:
        set_version(pair[0], pair[1], git_version)


def reset_cargo_manifests():
    """
    Reset all the manifests to their checked-out state.
    """
    try:
        subprocess.check_output(
            f"git restore `git ls-files **/Cargo.toml`",
            stderr=subprocess.STDOUT,
            shell=True,
        )
    except subprocess.CalledProcessError as e:
        print(f"Error resetting Cargo manifests:\n{e.output}")
        sys.exit(1)


def is_version_published_on_crates_io(crate: str, version: str) -> bool:
    """
    Return true if VERSION of CRATE is already on crates-io.
    """
    published_versions = crates_io_published_versions(crate)
    print(f"Published versions are {published_versions}")
    return version in published_versions


def current_version(crate: str) -> str:
    """
    Return the current version of CRATE, according to Cargo reading
    its own metadata.
    """
    try:
        cargo_metadata = json.loads(
            subprocess.check_output(
                f"cargo metadata --format-version 1 --no-deps",
                shell=True,
            )
        )
        current_crate_meta = next(
            meta for meta in cargo_metadata["packages"] if meta["name"] == crate
        )
        return current_crate_meta["version"]
    except subprocess.CalledProcessError as e:
        print(f"Cargo error while fetching the current version:\n{e.output}")
        sys.exit(1)


def handle_single_crate_with_crates_io(crate: str):
    crate_version = current_version(crate)
    if not is_version_published_on_crates_io(crate, crate_version):
        publish(crate, crate_version, CRATES_IO)


def main(crate: str, registry: str):
    if registry != CRATES_IO:
        print("Only crates-io registry is supported now")
        sys.exit(1)

    if crate == ALL_CRATES:
        for crate in ALL_CRATES_PATHS_IN_ORDER:
            handle_single_crate_with_crates_io(crate[0])
        sys.exit(0)

    handle_single_crate_with_crates_io(crate)
    sys.exit(0)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        prog="publish_crates",
        description="Publish a crate to the given registry",
        epilog="Created by Fiberplane <info@fiberplane.com>",
    )
    parser.add_argument(
        "-p",
        "--package",
        default=ALL_CRATES,
        help=f"Name of the package to publish, omit or use '{ALL_CRATES}' to do all packages",
    )
    parser.add_argument(
        "-r",
        "--registry",
        help=f"Registry to publish to, defaults to '{CRATES_IO}'",
        default=CRATES_IO,
    )

    args = parser.parse_args()
    set_cargo_manifests_git_version("artifactory")
    # main(args.package, args.registry)
