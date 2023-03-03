use crate::TaskResult;
use anyhow::Context;
use clap::Parser;
use std::{fs, path::Path};

#[derive(Parser)]
pub struct BumpVersionArguments {
    /// Name of the dependency to bump.
    #[clap(long, short)]
    dependency: String,

    /// The new version of the dependency.
    #[clap(long, short)]
    version: String,
}

pub fn bump_version<P: AsRef<Path>>(cargo_path: P, args: &BumpVersionArguments) -> TaskResult {
    let cargo_toml = fs::read_to_string(cargo_path).with_context(|| "Cannot read Cargo file")?;
    let output = bump_version_in_toml(&cargo_toml, args)?;
    fs::write(cargo_path, output).with_context(|| "Cannot write Cargo file")
}

fn bump_version_in_toml(cargo_toml: &str, args: &BumpVersionArguments) -> anyhow::Result<String> {}

#[cfg(test)]
mod tests {
    use super::{bump_version_in_toml, BumpVersionArguments};
    use pretty_assertions::assert_eq;

    #[test]
    fn test_bump_version_in_workspace_toml() {
        let workspace_toml = r#"[workspace]
members = [
    "base64uuid",
    "fiberplane",
    "fiberplane-api-client",
]

[workspace.package]
version = "1.0.0-alpha.1"
authors = ["Fiberplane <info@fiberplane.com>"]
edition = "2021"
license = "MIT OR Apache-2.0"
repository = "https://github.com/fiberplane/fiberplane"
rust-version = "1.64"

[workspace.dependencies]
base64uuid = { version = "1.0.0", path = "base64uuid", default-features = false }
bytes = "1"
fp-bindgen = { version = "3.0.0-alpha.1" }
fiberplane = { version = "1.0.0-alpha.1", path = "fiberplane" }
fiberplane-api-client = { version = "1.0.0-alpha.1", path = "fiberplane-api-client" }
once_cell = { version = "1.8" }
vergen = { version = "7.4.2", default-features = false, features = [
    "build",
    "git",
] }

[patch.crates-io]
#fp-bindgen = { git = "ssh://git@github.com/fiberplane/fp-bindgen.git", branch = "main" }
#fp-bindgen = { path = "../fp-bindgen/fp-bindgen" }
"#;

        let expected_toml = r#"[workspace]
members = [
    "base64uuid",
    "fiberplane",
    "fiberplane-api-client",
]

[workspace.package]
version = "1.0.0-beta.1"
authors = ["Fiberplane <info@fiberplane.com>"]
edition = "2021"
license = "MIT OR Apache-2.0"
repository = "https://github.com/fiberplane/fiberplane"
rust-version = "1.64"

[workspace.dependencies]
base64uuid = { version = "1.0.0", path = "base64uuid", default-features = false }
bytes = "1"
fp-bindgen = { version = "3.0.0-alpha.1" }
fiberplane = { version = "1.0.0-beta.1", path = "fiberplane" }
fiberplane-api-client = { version = "1.0.0-alpha.1", path = "fiberplane-api-client" }
once_cell = { version = "1.8" }
vergen = { version = "7.4.2", default-features = false, features = [
    "build",
    "git",
] }

[patch.crates-io]
#fp-bindgen = { git = "ssh://git@github.com/fiberplane/fp-bindgen.git", branch = "main" }
#fp-bindgen = { path = "../fp-bindgen/fp-bindgen" }
"#;

        let output = bump_version_in_toml(
            workspace_toml,
            &BumpVersionArguments {
                dependency: "fiberplane".to_owned(),
                version: "1.0.0-beta.1".to_owned(),
            },
        )
        .unwrap();
        assert_eq!(&output, expected_toml);
    }

    #[test]
    fn test_bump_version_in_crate_toml() {
        let crate_toml = r#"[package]
name = "fiberplane"
version = "1.0.0-alpha.1"

[features]
clap = ["fiberplane-models?/clap"]

[dependencies]
base64uuid = { workspace = true, default-features = false, optional = true }
fiberplane-api-client = { workspace = true, optional = true }
"#;

        let expected_toml = r#"[package]
name = "fiberplane"
version = "1.0.0-beta.1"

[features]
clap = ["fiberplane-models?/clap"]

[dependencies]
base64uuid = { workspace = true, default-features = false, optional = true }
fiberplane-api-client = { workspace = true, optional = true }
"#;

        let output = bump_version_in_toml(
            crate_toml,
            &BumpVersionArguments {
                dependency: "fiberplane".to_owned(),
                version: "1.0.0-beta.1".to_owned(),
            },
        )
        .unwrap();
        assert_eq!(&output, expected_toml);
    }

    #[test]
    fn test_bump_dependency_version_in_crate_toml() {
        let crate_toml = r#"[package]
name = "fiberplane"
version = "1.0.0-alpha.1"

[features]
clap = ["fiberplane-models?/clap"]

[dependencies]
base64uuid = { workspace = true, default-features = false, optional = true }
fiberplane-api-client = { version = "1.0.0-alpha.1", optional = true }
"#;

        let expected_toml = r#"[package]
name = "fiberplane"
version = "1.0.0-alpha.1"

[features]
clap = ["fiberplane-models?/clap"]

[dependencies]
base64uuid = { workspace = true, default-features = false, optional = true }
fiberplane-api-client = { version = "1.0.0-beta.1", optional = true }
"#;

        let output = bump_version_in_toml(
            crate_toml,
            &BumpVersionArguments {
                dependency: "fiberplane-api-client".to_owned(),
                version: "1.0.0-beta.1".to_owned(),
            },
        )
        .unwrap();
        assert_eq!(&output, expected_toml);
    }

    #[test]
    fn test_bump_version_in_crate_toml_with_workspace_version() {
        let crate_toml = r#"[package]
name = "fiberplane"
version = { workspace = true }

[features]
clap = ["fiberplane-models?/clap"]

[dependencies]
base64uuid = { workspace = true, default-features = false, optional = true }
fiberplane-api-client = { workspace = true, optional = true }
"#;

        let output = bump_version_in_toml(
            crate_toml,
            &BumpVersionArguments {
                dependency: "fiberplane".to_owned(),
                version: "1.0.0-beta.1".to_owned(),
            },
        )
        .unwrap();
        // No changes expected.
        assert_eq!(&output, crate_toml);
    }
}
