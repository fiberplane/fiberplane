--- 
title: Working with parameters 
---

Parameters are values that can be inserted in the notebook programmatically when a template is invoked. They’re like arguments in a CLI commands or content objects in some front-end templating languages like Liquid.

## Basic parameter usage

```jsonnet
function(incidentName)
  fp.notebook
  .new('Incident Response for: ' + incidentName)
  .addCells([
    c.text('Hello World!'),
  ])

```

In the above code snippet, from our example template, we initiate a parameter called `incidentName`. When the template is invoked, all instances of it in the template will be replaced by its value. Parameters can be set for any part of the template, meaning that any part of the notebook can be programmatically set on creation: title, time range, labels, text, PromQL, Elasticsearch queries, etc.

> ⚠️ Note
>
> Parameters *must always* have a value, otherwise invoking a template
> will fail.

### Default parameter values

You can provide a default value for the template like this:

```jsonnet
function(incidentName="API Outage")
		fp.notebook
			.new('Incident Response for: ' + incidentName)
			.addCells([
				c.text('Hello World!'),
			])
```

In this case if there are no values that are passed to the template when it's invoked, the template will resolve with the provided default value and create a notebook.

> 📘 Note
>
> If you’re providing several parameters to a function, parameters
> without a default value must be listed first.

## Object and array parameters

Parameters can be simple strings like above or numbers but they can also be objects or arrays. An object parameter could be a payload from an API response or a Webhook event that gets passed to a Fiberplane template and includes a bundle of data you want the template to work with (more on that in the [Triggers section](doc:working-with-triggers)).

Here’s a simple nested JSON object that designates an event ID, type (incident), environment (production), and our first on-call engineer:

```json
{
   "event":{
      "id":"13F",
      "type":"incident",
      "environment":"production",
      "assignee":"Paul Atreides"
   }
}
```

And here’s our example template adjusted that takes advantage of the data in this parameter:

```jsonnet
function(
  event={
    id: '',
    environment: '',
    assignee: '',
  }
)
  fp.notebook
  .new('Incident Response - ' + event.id)
  .addCells([
    c.text('Environment: ' + event.environment),
    c.text('On-call: ' +
           event.assignees),
  ])
```

In the updated template we tell the function that the parameter will be an object `event={}` . In the subsequent function we then access the object’s properties and add them to our notebook cells.

### Mapping arrays to the template (”looping” over an array)

While you can access array elements similarly to the object ones individually, a more likely scenario is that you will want to loop over an array of data and output a number of cells based on it.

Let’s say our example data includes 3 on-call engineers listed in an array (as opposed to 1):

```json
{
	"event": {
		"id": "13F",
		"type": "incident",
		"environment": "production",
		"assignees": [
			{
				"name": "Paul Atreides" 
			},
			{ 
				"name": "Duncan Idaho" },
			{ 
				"name": "Gurney Halleck"
			}
		]
	}
}
```

We want to loop over this array and output the assignees in a bulleted list in a Fiberplane notebook.

While you can’t loop over items in Jsonnet you can achieve basically the same thing using the `std.map` function from the [standard library of functions available in Jsonnet](https://jsonnet.org/ref/stdlib.html).

`std.map(function, array)` will take in the function we want to apply to each of our arrays elements (creating list items) and the array itself (in this case our array lives in the nested object and can be accessed like this: `event.assignees`). In the `function` element we can call our Fiberplane helper functions: `function(assignees) c.listItem.unordered(assignees.name)`

Here’s how the final result looks like in our example template:

```jsonnet
function(
  event={
    id: '',
    type: '',
    environment: '',
    assignees: [
      {
        name: '',
      },
    ],
  }
)
  fp.notebook
  .new('Incident Response - ' + event.id)
  .addCells([
    c.text('Environment: ' + event.environment),
    c.text('On-call:'),
    std.map(
      function(assignees)
        c.listItem.unordered(assignees.name),
      event.assignees
    ),
  ])
```

This is just a quick example how you can pass data to your templates and dynamically create notebooks in Fiberplane! You can find more template examples [in our Quickstart repo here!](http://github.com/fiberplane/quickstart)
