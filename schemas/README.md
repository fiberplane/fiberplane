# Schemas

This directory contains the OpenAPI schema definitions for the API. While this
document goes into the conventions we use in our API and in our OpenAPI schema.

## API conventions

The following sections go into some details around the conventions we use.

### Operations

In OpenAPI, operations are a combination of a HTTP method and a path. The
essentially map to a server side function. We use the following naming
convention for some common CRUD operations:

- `<ResourceName>_create` - This operation is used to create a single instance.
- `<ResourceName>_get` - This operation is used to get a single instance.
- `<ResourceName>_update` - This operation is used to update a single instance.
- `<ResourceName>_delete` - This operation is used to delete a single instance.
- `<ResourceName>_list` - This operation is used to list multiple instances.

Besides the CRUD operations there are also going to be other operations. In
these cases the resource name will be still be as the prefix and then the
operation will be used as the suffix. For example, we could have a operation
named: `notebook_duplicate`.

### Objects

Most endpoint either accept or return a certain object. We use the following
naming for these objects:

- `New<ResourceName>` - These types are used to create a certain resource. They
  are used in tandem with the Create operation.
- `Update<ResourceName>` - These types are used to update a certain resource. All properties
  should be Optional, if they are not set, then they won't update the resource.
- `<ResourceName>` - These types contain all the information about a certain
  resource. They should be returned for the Get, Create and Update operations.
- `<ResourceName>Summary` - These types are returned as part of a list endpoint
  and when they are embedded into other resources. They should contain a subset
  of the properties of the full resource.

## Schema conventions

These conventions that developers should use when making changes to our OpenAPI
schema definitions.

### Casing

We use some casing conventions to ensure that our schema and expected
requests/response are consistent. This is to make it easier to work with. The
following table summarize the conventions we use, whereas the following sections go into more details.

| Type | Casing |
|------|--------|
| References in OpenAPI doc | camel case |
| Properties in schema | camel case |
| Discriminators for enum values | snake case |
| Operation ID's | snake case |
| Query string keys | snake case |
| Query string enum values | snake case |
| Values in URL's | snake case |

#### Reference in OpenAPI doc

In OpenAPI it is possible to reference another schema or parameter using `$ref`.
In these cases we should use `camel case`. Although these properties do
not have a impact on the response or request body, it is better to have a
consistent experience with the rest of the yaml definitions.

```yaml
schema:
  $ref: "#/components/schemas/newNotebook"
```

#### Properties in schema

For properties in the schema for request or response bodies, we should use
`camel case`. This is the common convention used when serializing to JSON.

```yaml
schemas:
  newNotebook:
    properties:
      timeRange:
        type: string
```

#### Discriminators for enum values

Our API supports returning a enum with data associated with its value. We
serialize this using the OpenAPI oneOf construct with with a discriminator. The
value for this discriminator should be `snake case`.

```yaml
cell:
  discriminator:
    propertyName: type
    mapping:
      list_item: "#/components/schemas/listItemCell"
      checkbox: "#/components/schemas/checkboxCell"
```

#### Operation ID's

Operation ID's are used to identify a operation in the API. These come in the
form of a small text describing the operation, see the Operations section for
more details. These operation ID's always use the `snake case`.

```yaml
paths:
  /api/workspaces/{workspaceId}/notebooks:
    get:
      operationId: notebook_list
```

#### Query string keys

It is possible to pass extra (optional) parameters to a endpoint using a query
string value. The keys to identify these parameters should use `snake case`.

```yaml
parameters:
  sortDirection:
    in: query
    name: sort_direction

```

#### Query string enum values

The values for a query string parameter can be any type, such as a number,
string. In some cases it is only possible to use a certain set of values, a
enum. The values for these should use the same convention as the discriminator,
so it requires the use of `snake case`.

```yaml
parameters:
  - in: query
    name: sort_by
    schema:
      type: string
      enum:
        - "title"
        - "created_at"
        - "expires_at"
```
