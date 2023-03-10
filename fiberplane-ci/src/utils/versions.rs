use anyhow::{bail, Result};

/// Formats a version number based on its components.
pub fn format_version(major: u32, minor: u32, patch: u32, suffix: Option<&str>) -> String {
    match suffix {
        Some(suffix) => format!("v{major}.{minor}.{patch}-{suffix}"),
        None => format!("v{major}.{minor}.{patch}"),
    }
}

/// Parses a version and strips the suffix.
///
/// This includes support for versions that have a double suffix, so only the
/// final one is stripped.
///
/// If the given version has no suffix, the result is the same as for
/// `parse_version().`
pub fn get_base_version(version: &str) -> Result<(u32, u32, u32, Option<&str>)> {
    let (major, minor, patch, suffix) = parse_version(version)?;

    let new_suffix = match suffix.and_then(|suffix| suffix.split_once('-')) {
        Some((base_suffix, _extra_suffix)) => Some(base_suffix),
        None => None,
    };

    Ok((major, minor, patch, new_suffix))
}

/// Checks whether the base of one version matches the other.
///
/// See: [get_base_version]
pub fn matches_base_version(version: &str, base_version: &str) -> bool {
    match (get_base_version(version), parse_version(base_version)) {
        (
            Ok((major, minor, patch, suffix)),
            Ok((base_major, base_minor, base_patch, base_suffix)),
        ) => {
            major == base_major
                && minor == base_minor
                && patch == base_patch
                && suffix == base_suffix
        }
        _ => false,
    }
}

/// Parses a version string into its major, minor and patch components, with an
/// optional suffix.
pub fn parse_version(version: &str) -> Result<(u32, u32, u32, Option<&str>)> {
    let Some(version) = version.strip_prefix("v") else {
        bail!("Invalid version");
    };

    let (version, suffix) = match version.split_once('-') {
        Some((version, suffix)) => (version, Some(suffix)),
        None => (version, None),
    };

    let parts: Vec<_> = version.split('.').collect();
    if parts.len() != 3 {
        bail!("Invalid version");
    }

    Ok((
        parts[0].parse()?,
        parts[1].parse()?,
        parts[2].parse()?,
        suffix,
    ))
}
