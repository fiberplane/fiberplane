---
title: Setting up triggers
---

Triggers enable you to invoke Fiberplane Templates and create notebooks via a Webhook call. This can be used to automatically create notebooks from alerts, deploy notifications, or connect it to your customer support tools.

## Creating a trigger

To create a trigger you will need the ID of the template you want the trigger be pointing to (you can find that using `fp templates list` command).

Then:

```bash
fp triggers create --template-id <TEMPLATE_ID>
```

The command will return the trigger URL used to invoke it that will look something like this (save this URL!):

```bash
https://fiberplane.com/api/triggers/:id/:secret_key
```

## Invoking a trigger

You can now add the trigger URL to anything that is capable of sending HTTP POST requests (e.g.: Zapier Webhooks). The POST request should include in the payload JSON object the data that the template is expected to receive.

Let’s take our earlier example template:

```jsonnet
function(
  incidentName
)
  fp.notebook
  .new("Incident Response for: " + incidentName)
  .addCells([
    c.text("Hello World!"),
  ])
```

After having created a trigger URL for this template we can send a simple POST request with a JSON body:

```bash
curl -X POST https://studio.fiberplane.com/api/triggers/your_id/your_secret_key \
     -H "Content-type: application/json" \
     -d '{"incidentName": "API Outage"}'
```

And a new notebook with a title “API Outage” will be created!
