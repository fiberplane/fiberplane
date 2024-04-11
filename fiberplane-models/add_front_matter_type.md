# How to add a new front matter type?

This how to contain the general plan (and the gotchas to avoid) to add a new type of front matter value. The
concrete example will be `PagerDuty`, but for any other type of front matter it would be the same thing.

## Add a new enum variant to FrontMatterValueSchema

This is where the type information will get transmitted to API consumers.

```diff lang="rust"
 #[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, Display)]
 #[cfg_attr(
     feature = "fp-bindgen",
     derive(Serializable),
     fp(rust_module = "fiberplane_models::front_matter_schemas")
 )]
 #[non_exhaustive]
 #[serde(rename_all = "snake_case", tag = "type")]
 pub enum FrontMatterValueSchema {
     Number(FrontMatterNumberSchema),
     String(FrontMatterStringSchema),
     DateTime(FrontMatterDateTimeSchema),
     User(FrontMatterUserSchema),
+    PagerDuty(FrontMatterPagerDutySchema),
 }
```

The extra `FrontMatterPagerDutySchema` will contain the relevant information to help API consumers display
the contained front matter value correctly, such as the displayed name of the entry, whether multiple values
can be expected, default values... Check the other `FrontMatter***Schema` types for examples.

## Follow compiler errors to fill the existing matches

This will mostly be filling the `FrontMatterValueSchema::validate_*` methods, which can be left as `todo!()` for now.

## Add a new enum variant to FrontMatterValue

The new variant must be added _before_ the String and Number types, as the `FrontMatterValue` enum is
marked as `serde(untagged)`

(This means that on deserialization, all variants are tested in order)

```diff lang="rust"
 #[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, Display)]
 #[cfg_attr(
     feature = "fp-bindgen",
     derive(Serializable),
     fp(rust_module = "fiberplane_models::notebooks::front_matter")
 )]
 #[non_exhaustive]
 #[serde(untagged)]
 pub enum FrontMatterValue {
     /// A timestamp front matter value
     DateTime(FrontMatterDateTimeValue),
     /// A list-of-timestamps front matter value
     DateTimeList(FrontMatterDateTimeList),
 
     /// A user front matter value
     User(FrontMatterUserValue),
     /// A list-of-users front matter value
     UserList(FrontMatterUserList),
 
+    PagerDuty(FrontMatterPagerDutyValue),
+
     /// A string front matter value
     String(FrontMatterStringValue),
     /// A list-of-strings front matter value
     StringList(FrontMatterStringList),
 
     /// A number front matter value
     Number(FrontMatterNumberValue),
     /// A list-of-numbers front matter value
     NumberList(FrontMatterNumberList),
 }
```

## Follow compiler errors to fill the existing matches

This mostly mean giving a string representation of the type (for error messages) and sometimes extra logic in the
schema validation code.

## Add new value type

The `FrontMatterPagerDutyValue` type (in the current example) is the structure that should live in the Rust code, so with
as much details as possible. To allow API users to give e.g. only a string as argument for a more complex structure, you
should write conversion code:

- `impl TryFrom<serde_json::Value> for FrontMatterPagerDutyValue` is mandatory to have a single location where verification
  is done for arbitrary objects.
- `impl TryFrom<&str>` might be useful if you want to allow users to pass a single string identifier for the given type.
  
## Add Front Matter Schema validation code

The main entry points to validate front matter values are:

- the `FrontMatterSchemaEntry::validate_value` method, and
- the `FrontMatterSchemaEntry::validate_front_matter_value` method.

The former takes ownership of a json value and tries to infer it to something that matches the schema (that is where the
`impl TryFrom<serde_json::Value>` is useful). The latter just checks by reference if an existing `FrontMatterValue` has the
correct type.

Using `FrontMatterSchemaEntry::validate_value` is usually safer, as it’s less brittle/dependent on the order of variants
in `FrontMatterValue` enum.

## Update OpenAPI schema with the new value variant

This is a manual synchronization step that helps producing correct documentation for API consumers.
