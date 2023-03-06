# Fiberplane CI

> Reusable commands and utils for CI/CD automation.

We do not publish this to `crates.io`, since it's not intended as a
general-purpose library. Our other libraries can depend on this using a direct
Git dependency. As such, this crate does not adhere to our SemVer policy.

Commands are exported in the form of handlers that accept `clap` arguments and
return a `TaskResult`. This allows for convenient integration into our `xtask`
crates, both in this and other repositories.
