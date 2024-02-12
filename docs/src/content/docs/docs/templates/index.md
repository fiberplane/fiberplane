---
title: Getting started with Templates
---

Fiberplane Templates are programmable workflows that allow you to automate notebook creation for your incident response, infrastructure debugging, and maintenance.

## Overview of a template

Templates are defined by a Jsonnet file that is added to your Fiberplane account through the CLI.

Templates export a Jsonnet function that accepts some parameters and creates a Notebook using the helper functions provided by the Fiberplane Jsonnet library (fiberplane.libsonnet). See an example template below:

```jsonnet
local fp = import 'fiberplane.libsonnet';
local c = fp.cell;

function(
    incidentName='Service Outage'
)
  fp.notebook
    .new('Incident Response for: ' + incidentName)
    .setTimeRangeRelative(minutes=60)
    .addCells([
      c.text('Hello World!')
    ])
```

Let’s break it down line by line:

```jsonnet

# Import a helper Jsonnet library for working with Fiberplane notebooks.

local fp = import 'fiberplane.libsonnet';
local c = fp.cell;

# Call a Jsonnet function passing a string ‘API Outage’ as a parameter incidentName. 

function(incidentName='API Outage') 

# Initiate a Fiberplane notebook.

  fp.notebook

# Calls a method that adds a title for the notebook passing a hardcoded string 
# and the parameter concatenated.

  .new('Incident Response for: ' + incidentName) 

# Sets the time range for the notebook to be relative to last hour

  .setTimeRangeRelative(minutes=60)
```

We'll cover each of these in greater detail in the docs on the left-hand side. By the way: you can find more practical, use-case specific template examples in our [Quickstart repo in the "templates/"](http://github.com/fiberplane/quickstart) subdirectory
