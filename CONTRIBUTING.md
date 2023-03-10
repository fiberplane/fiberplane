# Contributing

Please be advised that even though many of our repositories are open for outside
contributions, `fiberplane` is primarily a **read-only** repository for our
community. Fiberplane uses this repository to develop new features out in the
open, and you are encouraged to build custom solution on top of the source code
we provide here. Our [issue tracker](https://github.com/fiberplane/fiberplane/issues)
and [discussions forum](https://github.com/fiberplane/fiberplane/discussions)
are open to all in case you have issues or questions/suggestions.

Creating pull requests is restricted to Fiberplane employees, because changes to
the core data structures in this repository also need to be reflected in our
closed-source components. As such, _the following instructions are intended for
Fiberplane employees only._

## Set up Artifactory

Crates from this repository are automatically pushed to Artifactory upon merging
to main.

1. Login to [Artifactory](https://fiberplane.jfrog.io/ui/login/) using your
   Fiberplane email address.
2. Go to your [user profile](https://fiberplane.jfrog.io/ui/user_profile) and
   create an _Identity Token_.
3. Copy the generated token and paste it into a file on your workstation called
   `~/.cargo/credentials.toml`. The file should look like this:

```toml
[registries.artifactory]
token = "Bearer <TOKEN>"
```

4. The first time you try to fetch something from Artifactory, it will also
   prompt you for a username and password. The username you should provide is
   your full email address, and the password is the same token you used above.
   - If you receive a 500 error when trying to access the Artifactory registry,
     you probably used the correct token, but not the right username.

## TOML formatting

We use the "Even Better TOML" VS Code extension for formatting `Cargo.toml`
files. We also use the crate used by this extension when Cargo files need to be
manipulated through automation.

## Documentation

### Updating READMEs

Be careful editing any of the `README.md` files directly. Many contain
`<!-- cargo-rdme start/end -->` directives, in which case you should follow
these instructions to update those blocks:

- Make modifications to `<crate>/src/lib.rs`
- Make sure `cargo-rdme` is installed: `cargo install cargo-rdme`
- Run `cargo-rdme` in the crate folder where you wish to update the README.

### Template reference

If you update the Template API in `fiberplane-templates`, please make sure to
update the documentation. For instructions, see the
[templates README](fiberplane-templates/README.md#generating-documentation).
