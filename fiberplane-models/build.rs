pub fn main() {
    #[cfg(feature = "axum_06")]
    println!("cargo:warning=`axum_06` feature is deprecated and may be removed in the next version. Please upgrade to `axum_07`.");

    #[cfg(all(feature = "axum_06", feature = "axum_07"))]
    compile_error!(
        "`axum_06` and `axum_07` features are mutually exclusive. Please enable only one of them."
    );
}
