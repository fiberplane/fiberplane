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

## Adding types and their annotations

Whenever adding types to this repository, please keep the following in mind:

- Wherever feasible, public structs and enums must be `#[non_exhaustive]` to
  give us the ability to extend them without breaking backwards compatibility.
- In order to allow users to instantiate a `#[non_exhaustive]` struct, we must
  provide some kind of constructor for them. We typically provide one of the
  following two methods:

  - We use an explicit, custom constructor by the name `new()` if such a
    constructor would need few arguments whose meaning would be immediately
    clear from context.
  - For other situations, we derive from `TypedBuilder` so that users can
    conveniently call the setters they require, while the named setters will
    help to document the meaning of each field being set. When using
    `TypedBuilder`, please keep the following in mind:

    - Fields that are not required for instantiation should be marked with
      `#[builder(default)]`. These are usually fields wrapped in `Option`, but
      they can be other types too if they have a sensible default. However, even
      an `Option` field can be left without a default if it makes strong sense
      for the type. For instance, if you want to make sure users of the type
      don't accidentally omit it.
    - `Option` fields that marked as `#[builder(default)]` should have the
      `#[builder(setter(strip_option))]` annotation too. This makes sure users
      don't have to specify unnecessary `Some` wrappers.
    - Fields with types that have common `Into` implementations should also be
      marked with `#[builder(setter(into))]`. Examples are fields of type
      `String`, `Base64Uuid` and `Timestamp`.

  - Finally, structs with all optional fields may additionally derive `Default`.
    This also allows users to create instances using `Default::default()`, but
    they will need to imperatively assign any fields they want to set.

- For serialization, we consistently use the following annotation on `Option`
  fields: `#[serde(default, skip_serialization_if = "Option::is_none")]`
  The reason for this is that it saves serialization overhead, and also makes
  the generated TypeScript a bit easier to use, because the types will be
  converted to `field?: T` instead of `field: T | null`.

  - Note that other types than `Option` may also skip serialization if it makes
    sense for a given use case.

- When adding a new field to an existing type, it must use both the
  `#[builder(default)]` and `#[serde(default, skip_serialization_if = "...")]`
  annotations to avoid breaking changes.

- Removing a field or changing the type of an existing field is always a
  breaking change. The same goes for removing a type.

- Examples of fields with annotations:

  ```rs
  /// Field without special annotations. This makes sense, because the field
  /// is required and has no obvious default value.
  pub revision: u32;

  /// Maximum amount of retries. Default value is 3.
  #[builder(default = 3)]
  pub max_retries: u32;

  /// Field where all the annotations are combined. Note we use `setter(into)`
  /// here because the stripped type is `String`, for which common `Into`
  /// implementations are available.
  #[builder(default, setter(into, strip_option))]
  #[serde(default, skip_serialization_if = "Option::is_none")]
  pub description: Option<String>;

  /// Note that the previous example could be easily adjusted if the type
  /// were not wrapped in `Option`.
  #[builder(default, setter(into))]
  #[serde(default, skip_serialization_if = "String::is_empty")]
  pub description: String;
  ```

- Please add descriptive documentation to types and fields. What purpose does a
  type serve? What is the impact of setting a given field? Answering such
  questions in the documentation can provide valuable context.

  - Note that Rust documentation comments start with a triple slash and support
    limited Markdown. Double slashes are used for ordinary comments.

- When adding new types, please derive the following traits whenever possible:
  `Clone`, `Debug`, `Default`, `Deserialize`, `Eq`, `PartialEq`, `Serialize`,
  `Serializable`.

  - The `Serializable` trait comes from `fp-bindgen` and is added conditionally
    using the following annotation:

    ```rs
    #[cfg_attr(
        feature = "fp-bindgen",
        derive(Serializable),
        fp(rust_module = "<module_path>") // Set this to the path from where the type can be imported.
    )]
    ```

## Adding methods

When adding functions or methods, please take special care with defining
argument types.

- When taking ownership of an argument, prefer `impl Into<T>` for types that
  have common `Into` implementations. Examples of such types are `String`,
  `Base64Uuid` and `Timestamp`.
- When only a reference to an argument is needed, consider using
  `impl AsRef<T>`. This is mainly relevant for strings, where `impl AsRef<str>`
  is preferred over either `String` or `&str`.

The rationale for these suggestions is that they're both more ergonomic for the
caller (they both allow passing `&str` and `String` as well as other types
implementing the traits, such as `Cow<str>`), while also being composable with
one another. For a complex function, this means you can even define a generic
bound such as `T: AsRef<str> + Into<String>`, which still allows both types to
be passed seamlessly, while being able to pass those arguments into other
functions that accept either.

For an example of where this is beneficial in practice, see
`Cell::with_text_for_field()`. Depending on cell type, it needs to pass its
`text` argument to either a method that wants references or a method that wants
to take ownership.

A more naive function could of course simply take `String` or `&str`, but it
forces the conversion on the caller and may cause unnecessary allocations.

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
