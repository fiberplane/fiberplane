---
title: Webhook events and their payloads
---

Upon creation or updating of a payload, you can choose a list of categories for which your configured endpoint
should receive deliveries for. Every delivery of every category shares common properties and contain
per-event specific data in the `payload` property.

## Common properties

| Property    | Type            | Format            | Description                                                                          |
|-------------|-----------------|-------------------|--------------------------------------------------------------------------------------|
| `id`        | String          | Base64Uuid        | Unique ID of this event. This is shared by every delivery across all webhooks        |
| `type`      | String          |                   | Event Type in format `category.event`                                                |
| `sender`    | Optional Object | [UserSummary][us] | The user that caused this event to be emitted. May be null                           |
| `workspace` | Object          | [Workspace][ws]   | The workspace in which this event occurred                                           |
| `webhook`   | String          | Base64Uuid        | Webhook ID of this very webhook subscriber. This is unique across all of Fiberplane. |
| `payload`   | Any             |                   | Differs across `type`s. Please see sections below for specification of this value.   |

## Headers

Every delivery includes custom headers

| Header                   | Description                                                                                 | Reference                                          |
|--------------------------|---------------------------------------------------------------------------------------------|----------------------------------------------------|
| `X-Fiberplane-Signature` | HMAC SHA512 signature of this payload                                                       | See [Securing your webhook](doc:webhooks-security) |
| `X-Fiberplane-Timestamp` | Date and time at which this webhook payload was sent as a RFC 3339 formatted timestamp      |                                                    |
| `X-Fiberplane-ETag`      | SHA-512 hash of the request body. Must be used to prevent double handling of the same event |                                                    |

[us]: https://docs.fiberplane.com/reference/profile_get-1
[ws]: https://docs.fiberplane.com/reference/workspace_get-1

## Example payload

```http request
POST /delivery HTTP/1.1
Host: yourdomain.com
User-Agent: Fiberplane Webhooks (https://docs.fiberplane.com/docs/webhooks)
Accept: */*
Cache-Control: max-age=0
Content-Type: application/vnd.fiberplane.webhook+json
X-Fiberplane-Signature: v1=201a8c2ed54b17481b87347bf6491b32bc23b607d38f80a249ede4a687ddb69347ab40e4253f2d4dce667ff8227487de72b4151d43d0748c6a0d35aaebca941d
X-Fiberplane-Timestamp: 2023-03-16T11:49:34Z
X-Fiberplane-ETag: d901855b7939b02f8525c48241f10cb6a2936b53e922cc626f040188dd1d4af40e1b343351c66e8499f47878c6f32e57c3aa1d4346e7872e56f6abf9d0a82714

{
    "id": "LL1cDW2QSvq72y1C0dMBdQ",
    "type": "frontmatter.update",
    "sender": {
        "id": "VZBuD3DJRAqaFtYfxb9eYQ",
        "email": "mari@fiberplane.com",
        "name": "Mari Steiner"
    },
    "workspace": {
        "id": "0li9_5B8Sq2fPg7oLfZ5nw",
        "name": "fiberplane",
        "displayName": "Fiberplane",
        "type": "organization",
        "ownerId": "rTsmdSOGQqWFvBqYCtV-4Q",
        "defaultDataSources": {},
        "createdAt": "2022-11-14T15:23:25.777867Z",
        "updatedAt": "2022-11-14T15:23:25.777867Z"
    },
    "webhook": "aGlDTe73R6S-wFB4B0F9Zw",
    "payload": {
        "notebook": {
            "id": "JP7mS-N8Q9-vgAZCnRIqwQ",
            "workspaceId": "0li9_5B8Sq2fPg7oLfZ5nw",
            "createdAt": "2023-03-16T11:49:34Z",
            "updatedAt": "2023-03-16T11:49:34Z",
            "title": "RFC-92 Webhooks Implementation Detail",
            "visibility": "private",
            "createdBy": {
                "type": "user",
                "id": "VZBuD3DJRAqaFtYfxb9eYQ",
                "name": "Mari Steiner"
            },
            "labels": [
                {
                    "key": "status",
                    "value": "pending"
                },
                {
                    "key": "type",
                    "value": "rfc"
                }
            ]
        },
        "diff": {
            "updates": {
                "severity": "critical"
            },
            "removals": {}
        }
    }
}
```

## `ping`

Category: `ping` (0)

This event occurs when creating a new webhook or updating an existing one. It is used to verify
whenever the endpoint works correctly. If the endpoint fails to respond with a `2xx` status code,
the webhook will be disabled. For more information see the [Webhooks introduction](doc:webhooks#ping-event).

The `payload` property is an empty object.

## `frontmatter.update`

Category: `frontmatter` (1)

An existing front matter property has been updated, a new one has been created or one has been deleted.
You will receive this event for every notebook in the whole workspace.

The `payload` property is an object with the following properties:

| Property   | Type   | Format                | Description                                                      |
|------------|--------|-----------------------|------------------------------------------------------------------|
| `notebook` | Object | [NotebookSummary][ns] | Summary about the notebook in which the front matter was updated |
| `diff`     | Object | See below             | The difference between before and now                            |

`diff` object:

| Property   | Type   | Format                              | Description                                                          |
|------------|--------|-------------------------------------|----------------------------------------------------------------------|
| `updates`  | Object | Key: String / Value: Any JSON value | All updated front matter keys and their updated value                |
| `removals` | Object | Key: String / Value: Any JSON value | All removed front matter keys and their value prior to being removed |

## `frontmatter.delete`

Category: `frontmatter` (1)

All front matter properties for a given notebook have been deleted.
You will receive this event for every notebook in the whole workspace.

The `payload` property is an object with the following properties:

| Property   | Type     | Format                | Description                                                      |
|------------|----------|-----------------------|------------------------------------------------------------------|
| `notebook` | Object   | [NotebookSummary][ns] | Summary about the notebook in which the front matter was cleared |

[ns]: https://docs.fiberplane.com/reference/notebook_list
