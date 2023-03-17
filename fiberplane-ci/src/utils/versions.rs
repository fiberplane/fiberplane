use anyhow::{bail, Result};

/// Formats a version number based on its components.
///
/// Note: This does not insert a leading 'v'.
pub fn format_version(major: u32, minor: u32, patch: u32, suffix: Option<&str>) -> String {
    match suffix {
        Some(suffix) => format!("{major}.{minor}.{patch}-{suffix}"),
        None => format!("{major}.{minor}.{patch}"),
    }
}

/// Parses a version and returns the count at the end of the suffix.
///
/// ```rust
/// use fiberplane_ci::utils::get_suffix_count;
///
/// assert_eq!(get_suffix_count("1.0.0-alpha.3").unwrap(), 3);
/// assert_eq!(get_suffix_count("v2.1.0-beta.2-alpha.1").unwrap(), 1);
/// ```
pub fn get_suffix_count(version: &str) -> Result<u16> {
    let (_, _, _, Some(suffix)) = parse_version(version)? else {
        bail!("Version has no suffix");
    };
    let (_, count) = parse_suffix(suffix)?;
    Ok(count)
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

    let new_suffix = suffix
        .and_then(|suffix| suffix.split_once('-'))
        .map(|(base_suffix, _)| base_suffix);

    Ok((major, minor, patch, new_suffix))
}

/// Checks whether the base of one version matches the other.
///
/// ```rust
/// use fiberplane_ci::utils::matches_base_version;
///
/// assert!(matches_base_version("1.0.0-alpha.3", "1.0.0"));
/// assert!(matches_base_version("v2.1.0-beta.2-alpha.1", "2.1.0-beta.2"));
/// assert!(!matches_base_version("1.0.0-alpha.3", "1.0.0-alpha.3"));
/// assert!(!matches_base_version("v2.2.0-beta.2-alpha.1", "2.1.0-beta.2"));
/// assert!(!matches_base_version("v2.1.0-beta.3-alpha.1", "2.1.0-beta.2"));
/// ```
///
/// See also: [get_base_version]
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

/// Parses a version's suffix into its count and the remainder of the suffix.
///
/// ```rust
/// use fiberplane_ci::utils::parse_suffix;
///
/// assert_eq!(parse_suffix("alpha.3").unwrap(), ("alpha.", 3));
/// assert_eq!(parse_suffix("beta.2-alpha.1").unwrap(), ("beta.2-alpha.", 1));
/// ```
pub fn parse_suffix(suffix: &str) -> Result<(&str, u16)> {
    let Some(last_dot_position) = suffix.chars().rev().position(|char| char == '.') else {
        bail!("Suffix contains no dot to mark its count");
    };
    let count_index = suffix.len() - last_dot_position;
    let count: u16 = suffix[count_index..].parse()?;
    Ok((&suffix[..count_index], count))
}

/// Parses a version string into its major, minor and patch components, with an
/// optional suffix.
pub fn parse_version(version: &str) -> Result<(u32, u32, u32, Option<&str>)> {
    let version = version.strip_prefix('v').unwrap_or(version);

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
