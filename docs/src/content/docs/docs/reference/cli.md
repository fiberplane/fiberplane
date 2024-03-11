---
title: CLI Reference
---

## `fp`

**Usage:** `fp [OPTIONS] <COMMAND>`

###### **Subcommands:**

* `data-sources` — Interact with data sources
* `experiments` — Experimental commands
* `login` — Login to Fiberplane and authorize the CLI to access your account
* `logout` — Logout from Fiberplane
* `labels` — Interact with labels
* `new` — Create a new notebook and open it in the browser
* `notebooks` — Interact with notebooks
* `providers` — Interact with providers
* `daemons` — Interact with Fiberplane Daemon instances
* `run` — Run a command and send the output to a notebook
* `templates` — Interact with templates
* `shell` — Launch a recorded shell session that'll show up in the notebook
* `snippets` — Snippets allow you to save reusable groups of cells and insert them into notebooks
* `views` — Views allow you to save label searches and display them as a view, allowing you to search for notebooks easier and more convenient
* `triggers` — Interact with triggers
* `events` — Interact with events
* `tokens` — Interact with API tokens
* `update` — Update the current FP binary
* `users` — Interact with user details
* `workspaces` — Interact with workspaces
* `webhooks` — Interact with webhooks
* `integrations` — Interact with integrations
* `version` — Display extra version information

###### **Options:**

* `--base-url <BASE_URL>` — Base URL to the Fiberplane API

  Default value: `https://studio.fiberplane.com`
* `--config <CONFIG>` — Path to Fiberplane config file
* `--token <TOKEN>` — Override the API token used
* `--disable-version-check` — Disables the version check
* `-v`, `--verbose` — Display verbose logs
* `--log-file <LOG_FILE>` — Path to log file
* `-w`, `--workspace-id <WORKSPACE_ID>` — Workspace to use



## `fp data-sources`

Interact with data sources

Create and manage data sources, and list both direct and FPD data sources.

**Usage:** `fp data-sources <COMMAND>`

###### **Subcommands:**

* `create` — Create a new workspace data source
* `defaults` — View and modify the default data sources for the workspace
* `delete` — Delete a workspace data source
* `get` — Get the details of a workspace data source
* `list` — List all workspace data sources
* `update` — Update a data source



## `fp data-sources create`

Create a new workspace data source

**Usage:** `fp data-sources create [OPTIONS]`

###### **Options:**

* `-n`, `--name <NAME>` — Name of the data source
* `-d`, `--description <DESCRIPTION>` — Description of the data source
* `-p`, `--provider-type <PROVIDER_TYPE>` — Provider type of the data source
* `--provider-config <PROVIDER_CONFIG>` — Provider configuration
* `-o`, `--output <OUTPUT>` — Output of the notebook

  Default value: `table`

  Possible values:
  - `table`:
    Output the values as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp data-sources defaults`

View and modify the default data sources for the workspace

**Usage:** `fp data-sources defaults <COMMAND>`

###### **Subcommands:**

* `get` — Get the default data sources
* `set` — Set the default data source for the given provider type
* `unset` — Unset the default data source for the given provider type



## `fp data-sources defaults get`

Get the default data sources

**Usage:** `fp data-sources defaults get [OPTIONS]`

###### **Options:**

* `-o`, `--output <OUTPUT>` — Display format for the output

  Default value: `table`

  Possible values:
  - `table`:
    Output the details as a table
  - `json`:
    Output the details as JSON




## `fp data-sources defaults set`

Set the default data source for the given provider type

**Usage:** `fp data-sources defaults set [OPTIONS]`

###### **Options:**

* `-d`, `--data-source-name <DATA_SOURCE_NAME>` — Name of the data source which should be set as default for the given provider type
* `-p`, `--daemon-name <DAEMON_NAME>` — If the data source is an FPD data source, the name of the daemon



## `fp data-sources defaults unset`

Unset the default data source for the given provider type

**Usage:** `fp data-sources defaults unset [OPTIONS]`

###### **Options:**

* `-p`, `--provider-type <PROVIDER_TYPE>` — Provider type for which the default data source should be unset



## `fp data-sources delete`

Delete a workspace data source

**Usage:** `fp data-sources delete [OPTIONS]`

###### **Options:**

* `-n`, `--name <NAME>` — Name of the data source



## `fp data-sources get`

Get the details of a workspace data source

**Usage:** `fp data-sources get [OPTIONS]`

###### **Options:**

* `-n`, `--name <NAME>` — Name of the data source
* `-o`, `--output <OUTPUT>` — Output of the notebook

  Default value: `table`

  Possible values:
  - `table`:
    Output the values as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp data-sources list`

List all workspace data sources

**Usage:** `fp data-sources list [OPTIONS]`

###### **Options:**

* `-o`, `--output <OUTPUT>` — Output of the notebook

  Default value: `table`

  Possible values:
  - `table`:
    Output the values as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp data-sources update`

Update a data source

**Usage:** `fp data-sources update [OPTIONS]`

###### **Options:**

* `-n`, `--name <NAME>` — Name of the data source to update
* `-d`, `--description <DESCRIPTION>` — New description of the data source
* `--provider-config <PROVIDER_CONFIG>` — New provider configuration
* `-o`, `--output <OUTPUT>` — Output format

  Default value: `table`

  Possible values:
  - `table`:
    Output the values as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp experiments`

Experimental commands

These commands are not stable and may change at any time.

**Usage:** `fp experiments <COMMAND>`

###### **Subcommands:**

* `message` — Append a message to the given notebook
* `crawl` — Starting with the given notebook, recursively crawl all linked notebooks and save them to the given directory as Markdown
* `prometheus-graph-to-notebook` — Open Prometheus graphs in a given notebook



## `fp experiments message`

Append a message to the given notebook

**Usage:** `fp experiments message [OPTIONS] [MESSAGE]...`

###### **Arguments:**

* `<MESSAGE>` — The message to append

###### **Options:**

* `-n`, `--notebook-id <NOTEBOOK_ID>` — The notebook to append the message to
* `-o`, `--output <OUTPUT>` — Output type to display

  Default value: `table`

  Possible values:
  - `table`:
    Output the result as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp experiments crawl`

Starting with the given notebook, recursively crawl all linked notebooks and save them to the given directory as Markdown

**Usage:** `fp experiments crawl [OPTIONS] --out-dir <OUT_DIR>`

###### **Options:**

* `-n`, `--notebook-id <NOTEBOOK_ID>`
* `--concurrent-downloads <CONCURRENT_DOWNLOADS>`

  Default value: `10`
* `-o`, `--out-dir <OUT_DIR>`



## `fp experiments prometheus-graph-to-notebook`

Open Prometheus graphs in a given notebook

**Usage:** `fp experiments prometheus-graph-to-notebook [OPTIONS]`

###### **Options:**

* `-n`, `--notebook-id <NOTEBOOK_ID>`
* `-p`, `--port <PORT>` — Server port number

  Default value: `9090`
* `-H`, `--listen-host <LISTEN_HOST>` — Hostname to listen on

  Default value: `127.0.0.1`



## `fp login`

Login to Fiberplane and authorize the CLI to access your account

**Usage:** `fp login`



## `fp logout`

Logout from Fiberplane

**Usage:** `fp logout`



## `fp labels`

Interact with labels

Labels allow you to organize your notebooks.

**Usage:** `fp labels <COMMAND>`

###### **Subcommands:**

* `list-keys` — List all unique labels keys that are used
* `list-values` — List all unique labels values that are used for a specific label key



## `fp labels list-keys`

List all unique labels keys that are used

**Usage:** `fp labels list-keys [OPTIONS]`

###### **Options:**

* `-p`, `--prefix <PREFIX>`
* `-o`, `--output <OUTPUT>` — Output of the notebook

  Default value: `list`

  Possible values:
  - `list`:
    Output the keys as a list
  - `json`:
    Output the result as a JSON encoded object




## `fp labels list-values`

List all unique labels values that are used for a specific label key

**Usage:** `fp labels list-values [OPTIONS] [LABEL_KEY]`

###### **Arguments:**

* `<LABEL_KEY>`

###### **Options:**

* `-p`, `--prefix <PREFIX>`
* `-o`, `--output <OUTPUT>` — Output of the notebook

  Default value: `list`

  Possible values:
  - `list`:
    Output the values as a list
  - `json`:
    Output the result as a JSON encoded object




## `fp new`

Create a new notebook and open it in the browser.

If you need access to the json use the `notebook create` command.

**Usage:** `fp new [OPTIONS] [TITLE]...`

###### **Arguments:**

* `<TITLE>` — Title for the new notebook

###### **Options:**

* `-w`, `--workspace-id <WORKSPACE_ID>` — Workspace to use



## `fp notebooks`

Interact with notebooks

Notebooks are the main resource that Studio exposes.

**Usage:** `fp notebooks <COMMAND>`

###### **Subcommands:**

* `create` — Create a notebook
* `duplicate` — Duplicate a notebook
* `get` — Retrieve a notebook
* `insert-snippet` — Insert a snippet into the notebook
* `list` — List all notebooks
* `search` — Search for a specific notebook This currently only supports label search
* `open` — Open a notebook in the studio
* `delete` — Delete a notebook
* `append-cell` — Append a cell to the notebook
* `front-matter` — Interact with front matter



## `fp notebooks create`

Create a notebook

**Usage:** `fp notebooks create [OPTIONS]`

###### **Options:**

* `-t`, `--title <TITLE>` — Title for the new notebook
* `-l`, `--label <label>` — Labels to attach to the newly created notebook (you can specify multiple labels)
* `--from <FROM>` — Start time to be passed into the new notebook (RFC3339). Leave empty to use 60 minutes ago
* `--to <TO>` — End time to be passed into the new notebook (RFC3339). Leave empty to use the current time
* `--front-matter <FRONT_MATTER>` — Front matter which should be added to the notebook upon creation. Leave empty to attach no front matter
* `-m`, `--markdown <MARKDOWN>` — Create the notebook from the given Markdown
* `-o`, `--output <OUTPUT>` — Output of the notebook

  Default value: `table`

  Possible values:
  - `table`:
    Output the result as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp notebooks duplicate`

Duplicate a notebook

**Usage:** `fp notebooks duplicate [OPTIONS]`

###### **Options:**

* `-n`, `--notebook-id <NOTEBOOK_ID>` — ID of the source notebook
* `-t`, `--title <TITLE>` — Title for the new notebook Defaults to "Copy of {SOURCE NOTEBOOK TITLE}"
* `-o`, `--output <OUTPUT>` — Output of the notebook

  Default value: `table`

  Possible values:
  - `table`:
    Output the result as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp notebooks get`

Retrieve a notebook

**Usage:** `fp notebooks get [OPTIONS]`

###### **Options:**

* `-n`, `--notebook-id <NOTEBOOK_ID>` — ID of the notebook
* `-o`, `--output <OUTPUT>` — Output of the notebook

  Default value: `table`

  Possible values:
  - `table`:
    Output the result as a table
  - `json`:
    Output the result as a JSON encoded object
  - `markdown`:
    Output the notebook as Markdown




## `fp notebooks insert-snippet`

Insert a snippet into the notebook

**Usage:** `fp notebooks insert-snippet [OPTIONS] [SNIPPET_NAME]`

###### **Arguments:**

* `<SNIPPET_NAME>` — The Name of the snippet

###### **Options:**

* `-w`, `--workspace-id <WORKSPACE_ID>` — The workspace to get the snippet from
* `-n`, `--notebook-id <NOTEBOOK_ID>` — The notebook to insert the snippet into
* `-c`, `--cell-id <CELL_ID>` — The cell ID after which the snippet should be inserted



## `fp notebooks list`

List all notebooks

**Usage:** `fp notebooks list [OPTIONS]`

###### **Options:**

* `-o`, `--output <OUTPUT>` — Output of the notebook

  Default value: `table`

  Possible values:
  - `table`:
    Output the result as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp notebooks search`

Search for a specific notebook This currently only supports label search

**Usage:** `fp notebooks search [OPTIONS] [VIEW]`

###### **Arguments:**

* `<VIEW>` — View used to search for notebooks

###### **Options:**

* `-l`, `--label <label>` — Labels to search notebooks for (you can specify multiple labels)
* `--sort-by <SORT_BY>` — Sort the result according to the following field

  Possible values: `title`, `created-at`, `updated-at`

* `--sort-direction <SORT_DIRECTION>` — Sort the result in the following direction

  Possible values: `ascending`, `descending`

* `-o`, `--output <OUTPUT>` — Output of the notebooks

  Default value: `table`

  Possible values:
  - `table`:
    Output the result as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp notebooks open`

Open a notebook in the studio

**Usage:** `fp notebooks open [OPTIONS]`

###### **Options:**

* `-n`, `--notebook-id <NOTEBOOK_ID>` — ID of the notebook



## `fp notebooks delete`

Delete a notebook

**Usage:** `fp notebooks delete [OPTIONS]`

###### **Options:**

* `-n`, `--notebook-id <NOTEBOOK_ID>` — ID of the notebook



## `fp notebooks append-cell`

Append a cell to the notebook

**Usage:** `fp notebooks append-cell [OPTIONS]`

###### **Options:**

* `-n`, `--notebook-id <NOTEBOOK_ID>` — ID of the notebook
* `--text <TEXT>` — Append a text cell
* `--code <CODE>` — Append a code cell
* `-o`, `--output <OUTPUT>` — Output type to display

  Default value: `table`

  Possible values:
  - `table`:
    Output the result as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp notebooks front-matter`

Interact with front matter

Front matter adds additional metadata to notebooks.

**Usage:** `fp notebooks front-matter <COMMAND>`

###### **Subcommands:**

* `update` — Updates front matter for an existing notebook
* `clear` — Clears all front matter from an existing notebook



## `fp notebooks front-matter update`

Updates front matter for an existing notebook

**Usage:** `fp notebooks front-matter update [OPTIONS] <FRONT_MATTER>`

###### **Arguments:**

* `<FRONT_MATTER>` — Front matter which should be added. Can override existing keys. To delete an existing key, set its value to `null`

###### **Options:**

* `--notebook-id <NOTEBOOK_ID>` — Notebook for which front matter should be updated for



## `fp notebooks front-matter clear`

Clears all front matter from an existing notebook

**Usage:** `fp notebooks front-matter clear [OPTIONS]`

###### **Options:**

* `--notebook-id <NOTEBOOK_ID>` — Notebook for which front matter should be cleared for



## `fp providers`

Interact with providers

Providers are wasm files that contain the logic to retrieve data based on a query. This is being used by Studio and FPD.

**Usage:** `fp providers <COMMAND>`

###### **Subcommands:**

* `invoke` — Invoke a provider with the new provider protocol



## `fp providers invoke`

Invoke a provider with the new provider protocol

**Usage:** `fp providers invoke [OPTIONS] --provider-path <PROVIDER_PATH> --request <REQUEST> --query-type <QUERY_TYPE> --config <CONFIG>`

###### **Options:**

* `-p`, `--provider-path <PROVIDER_PATH>` — Path to the provider WASM file
* `-r`, `--request <REQUEST>` — JSON encoded request that will be sent to the provider
* `-t`, `--query-type <QUERY_TYPE>` — Type of query for the provider (available options are set by the provider)
* `-q`, `--query-data <QUERY_DATA>` — Data to be sent to the provider
* `-m`, `--query-mime-type <QUERY_MIME_TYPE>` — Mime type of the query data

  Default value: `application/x-www-form-urlencoded`
* `-c`, `--config <CONFIG>` — JSON encoded config that will be sent to the provider



## `fp daemons`

Interact with Fiberplane Daemon instances

The Fiberplane Daemon allows you to expose services that are hosted within your network without exposing them or sharing credentials.

**Usage:** `fp daemons <COMMAND>`

###### **Subcommands:**

* `create` — Create a new daemon
* `list` — List all daemons
* `data-sources` — List all data sources
* `get` — Retrieve a single daemon
* `delete` — Delete a daemon



## `fp daemons create`

Create a new daemon

**Usage:** `fp daemons create [OPTIONS] [NAME] [DESCRIPTION]`

###### **Arguments:**

* `<NAME>` — Daemon name, leave empty to auto-generate a name
* `<DESCRIPTION>`

###### **Options:**

* `-o`, `--output <OUTPUT>` — Output of the daemon

  Default value: `table`

  Possible values:
  - `table`:
    Output the result as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp daemons list`

List all daemons

**Usage:** `fp daemons list [OPTIONS]`

###### **Options:**

* `-o`, `--output <OUTPUT>` — Output of the daemon

  Default value: `table`

  Possible values:
  - `table`:
    Output the result as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp daemons data-sources`

List all data sources

**Usage:** `fp daemons data-sources [OPTIONS]`

###### **Options:**

* `-o`, `--output <OUTPUT>` — Output of the daemon

  Default value: `table`

  Possible values:
  - `table`:
    Output the result as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp daemons get`

Retrieve a single daemon

**Usage:** `fp daemons get [OPTIONS] [DAEMON_NAME]`

###### **Arguments:**

* `<DAEMON_NAME>` — ID of the daemon

###### **Options:**

* `-o`, `--output <OUTPUT>` — Output of the daemon

  Default value: `table`

  Possible values:
  - `table`:
    Output the result as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp daemons delete`

Delete a daemon

**Usage:** `fp daemons delete [DAEMON_NAME]`

###### **Arguments:**

* `<DAEMON_NAME>` — Name of the daemon



## `fp run`

Run a command and send the output to a notebook

Note: to run a command with pipes, you must wrap the command in quotes. For example, `fp run "echo hello world | grep hello"`

**Usage:** `fp run [OPTIONS] [COMMAND]...`

###### **Arguments:**

* `<COMMAND>` — The command to run

###### **Options:**

* `-n`, `--notebook-id <NOTEBOOK_ID>` — The notebook to append the message to
* `-o`, `--output <OUTPUT>` — Output type to display

  Default value: `command`

  Possible values:
  - `command`:
    Output the result of the command
  - `table`:
    Output the cell details as a table
  - `json`:
    Output the cell details as a JSON encoded object




## `fp templates`

Interact with templates

Templates allow you to create notebooks based on jsonnet.

**Usage:** `fp templates <COMMAND>`

###### **Subcommands:**

* `init` — Initializes a blank template and save it in the current directory as template.jsonnet
* `expand` — Expand a template into a Fiberplane notebook
* `convert` — Create a template from an existing Fiberplane notebook
* `create` — Create a new template
* `get` — Retrieve a single template
* `delete` — Delete a template
* `list` — List of the templates that have been uploaded to Fiberplane
* `update` — Update an existing template
* `validate` — Validate a local template



## `fp templates init`

Initializes a blank template and save it in the current directory as template.jsonnet

**Usage:** `fp templates init [OPTIONS]`

###### **Options:**

* `-t`, `--template-path <TEMPLATE_PATH>`

  Default value: `./template.jsonnet`



## `fp templates expand`

Expand a template into a Fiberplane notebook

**Usage:** `fp templates expand <TEMPLATE> [TEMPLATE_ARGUMENTS]`

###### **Arguments:**

* `<TEMPLATE>` — ID or URL of a template already uploaded to Fiberplane, or the path or URL of a template file
* `<TEMPLATE_ARGUMENTS>` — Values to inject into the template



## `fp templates convert`

Create a template from an existing Fiberplane notebook

**Usage:** `fp templates convert [OPTIONS]`

###### **Options:**

* `-n`, `--notebook-id <NOTEBOOK_ID>` — Workspace to create the new template in Notebook ID
* `--template-name <TEMPLATE_NAME>` — Name of the new template (defaults to the notebook title, sluggified)
* `--description <DESCRIPTION>` — Description of the template
* `--create-trigger <CREATE_TRIGGER>` — Create a trigger for the template

  Possible values: `true`, `false`

* `-o`, `--output <OUTPUT>` — Output of the template

  Default value: `table`

  Possible values:
  - `table`:
    Output the details of the template as a table (excluding body)
  - `body`:
    Only output the body of the template
  - `json`:
    Output the template as a JSON encoded file




## `fp templates create`

Create a new template

**Usage:** `fp templates create [OPTIONS] <TEMPLATE>`

###### **Arguments:**

* `<TEMPLATE>` — Path or URL of to the template

###### **Options:**

* `--template-name <TEMPLATE_NAME>` — Name of the template
* `--description <DESCRIPTION>` — Description of the template
* `--create-trigger <CREATE_TRIGGER>` — Create a trigger for the template

  Possible values: `true`, `false`

* `-o`, `--output <OUTPUT>` — Output of the template

  Default value: `table`

  Possible values:
  - `table`:
    Output the details of the template as a table (excluding body)
  - `body`:
    Only output the body of the template
  - `json`:
    Output the template as a JSON encoded file




## `fp templates get`

Retrieve a single template

By default, this returns the template metadata. To retrieve the full template body, use the --output=body flag

**Usage:** `fp templates get [OPTIONS] [TEMPLATE_NAME]`

###### **Arguments:**

* `<TEMPLATE_NAME>` — The Name of the template

###### **Options:**

* `-w`, `--workspace-id <WORKSPACE_ID>` — The workspace to get the template from
* `-o`, `--output <OUTPUT>` — Output of the template

  Default value: `table`

  Possible values:
  - `table`:
    Output the details of the template as a table (excluding body)
  - `body`:
    Only output the body of the template
  - `json`:
    Output the template as a JSON encoded file




## `fp templates delete`

Delete a template

**Usage:** `fp templates delete [OPTIONS] [TEMPLATE_NAME]`

###### **Arguments:**

* `<TEMPLATE_NAME>` — The Name of the template

###### **Options:**

* `-w`, `--workspace-id <WORKSPACE_ID>` — The workspace to delete the template from



## `fp templates list`

List of the templates that have been uploaded to Fiberplane

**Usage:** `fp templates list [OPTIONS]`

###### **Options:**

* `-o`, `--output <OUTPUT>` — Output of the templates

  Default value: `table`

  Possible values:
  - `table`:
    Output the values as a table
  - `json`:
    Output the result as a JSON encoded object

* `--sort-by <SORT_BY>` — Sort the result according to the following field

  Possible values: `name`, `created-at`, `updated-at`

* `--sort-direction <SORT_DIRECTION>` — Sort the result in the following direction

  Possible values: `ascending`, `descending`




## `fp templates update`

Update an existing template

**Usage:** `fp templates update [OPTIONS] [TEMPLATE_NAME]`

###### **Arguments:**

* `<TEMPLATE_NAME>` — Name of the template to update

###### **Options:**

* `-w`, `--workspace-id <WORKSPACE_ID>` — The workspace containing the template to be updated
* `--description <DESCRIPTION>` — New description of the template
* `--template <TEMPLATE>` — New body of the template
* `--template-path <TEMPLATE_PATH>` — Path to the template new body file
* `-o`, `--output <OUTPUT>` — Output of the template

  Default value: `table`

  Possible values:
  - `table`:
    Output the details of the template as a table (excluding body)
  - `body`:
    Only output the body of the template
  - `json`:
    Output the template as a JSON encoded file




## `fp templates validate`

Validate a local template

Note that only templates without required parameters can be fully validated.

**Usage:** `fp templates validate <TEMPLATE> [TEMPLATE_ARGUMENTS]`

###### **Arguments:**

* `<TEMPLATE>` — Path to the template file or full template body to validate
* `<TEMPLATE_ARGUMENTS>` — Optional values to inject into the template



## `fp shell`

Launch a recorded shell session that'll show up in the notebook

**Usage:** `fp shell [OPTIONS]`

###### **Options:**

* `-n`, `--notebook-id <NOTEBOOK_ID>`



## `fp snippets`

Snippets allow you to save reusable groups of cells and insert them into notebooks

**Usage:** `fp snippets <COMMAND>`

###### **Subcommands:**

* `convert` — Convert cells from an existing notebook into a snippet
* `create` — Create a new snippet
* `delete` — Delete a snippet
* `get` — Get a snippet
* `insert` — Insert the snippet into a notebook
* `list` — List of the snippets that have been uploaded to Fiberplane
* `update` — Update an existing snippet
* `validate` — Validate a local snippet



## `fp snippets convert`

Convert cells from an existing notebook into a snippet

**Usage:** `fp snippets convert [OPTIONS]`

###### **Options:**

* `-n`, `--notebook-id <NOTEBOOK_ID>` — Workspace to create the new snippet in Notebook ID
* `-s`, `--start-cell <START_CELL>` — Starting cell of the snippet
* `-e`, `--end-cell <END_CELL>` — Ending cell of the snippet
* `--snippet-name <SNIPPET_NAME>` — Name of the new snippet (defaults to the notebook title, sluggified)
* `--description <DESCRIPTION>` — Description of the snippet
* `-o`, `--output <OUTPUT>` — Output of the snippet

  Default value: `table`

  Possible values:
  - `table`:
    Output the details of the snippet as a table (excluding body)
  - `body`:
    Only output the body of the snippet
  - `json`:
    Output the snippet as a JSON encoded file




## `fp snippets create`

Create a new snippet

**Usage:** `fp snippets create [OPTIONS] <SNIPPET>`

###### **Arguments:**

* `<SNIPPET>` — Path or URL of to the snippet

###### **Options:**

* `--snippet-name <SNIPPET_NAME>` — Name of the snippet
* `--description <DESCRIPTION>` — Description of the snippet
* `-o`, `--output <OUTPUT>` — Output of the snippet

  Default value: `table`

  Possible values:
  - `table`:
    Output the details of the snippet as a table (excluding body)
  - `body`:
    Only output the body of the snippet
  - `json`:
    Output the snippet as a JSON encoded file




## `fp snippets delete`

Delete a snippet

**Usage:** `fp snippets delete [OPTIONS] [SNIPPET_NAME]`

###### **Arguments:**

* `<SNIPPET_NAME>` — The Name of the snippet

###### **Options:**

* `-w`, `--workspace-id <WORKSPACE_ID>` — The workspace to delete the snippet from



## `fp snippets get`

Get a snippet

**Usage:** `fp snippets get [OPTIONS] [SNIPPET_NAME]`

###### **Arguments:**

* `<SNIPPET_NAME>` — The Name of the snippet

###### **Options:**

* `-w`, `--workspace-id <WORKSPACE_ID>` — The workspace to get the snippet from
* `-o`, `--output <OUTPUT>` — Output of the snippet

  Default value: `table`

  Possible values:
  - `table`:
    Output the details of the snippet as a table (excluding body)
  - `body`:
    Only output the body of the snippet
  - `json`:
    Output the snippet as a JSON encoded file




## `fp snippets insert`

Insert the snippet into a notebook

**Usage:** `fp snippets insert [OPTIONS] [SNIPPET_NAME]`

###### **Arguments:**

* `<SNIPPET_NAME>` — The Name of the snippet

###### **Options:**

* `-w`, `--workspace-id <WORKSPACE_ID>` — The workspace to get the snippet from
* `-n`, `--notebook-id <NOTEBOOK_ID>` — The notebook to insert the snippet into
* `-c`, `--cell-id <CELL_ID>` — The cell ID after which the snippet should be inserted



## `fp snippets list`

List of the snippets that have been uploaded to Fiberplane

**Usage:** `fp snippets list [OPTIONS]`

###### **Options:**

* `-o`, `--output <OUTPUT>` — Output of the snippets

  Default value: `table`

  Possible values:
  - `table`:
    Output the values as a table
  - `json`:
    Output the result as a JSON encoded object

* `--sort-by <SORT_BY>` — Sort the result according to the following field

  Possible values: `name`, `created-at`, `updated-at`

* `--sort-direction <SORT_DIRECTION>` — Sort the result in the following direction

  Possible values: `ascending`, `descending`




## `fp snippets update`

Update an existing snippet

**Usage:** `fp snippets update [OPTIONS] [SNIPPET_NAME]`

###### **Arguments:**

* `<SNIPPET_NAME>` — Name of the snippet to update

###### **Options:**

* `-w`, `--workspace-id <WORKSPACE_ID>` — The workspace containing the snippet to be updated
* `--description <DESCRIPTION>` — New description of the snippet
* `--snippet <SNIPPET>` — New body of the snippet
* `--snippet-path <SNIPPET_PATH>` — Path to the snippet new body file
* `-o`, `--output <OUTPUT>` — Output of the snippet

  Default value: `table`

  Possible values:
  - `table`:
    Output the details of the snippet as a table (excluding body)
  - `body`:
    Only output the body of the snippet
  - `json`:
    Output the snippet as a JSON encoded file




## `fp snippets validate`

Validate a local snippet

**Usage:** `fp snippets validate <SNIPPET>`

###### **Arguments:**

* `<SNIPPET>` — Path to the snippet file or full snippet body to validate



## `fp views`

Views allow you to save label searches and display them as a view, allowing you to search for notebooks easier and more convenient

**Usage:** `fp views <COMMAND>`

###### **Subcommands:**

* `create` — Create a new view
* `list` — List views
* `delete` — Delete a view
* `update` — Update an existing view



## `fp views create`

Create a new view

**Usage:** `fp views create [OPTIONS] --color <COLOR> [NAME] [DISPLAY_NAME] [DESCRIPTION] [TIME_RANGE_VALUE] [TIME_RANGE_UNIT] [SORT_BY] [SORT_DIRECTION]`

###### **Arguments:**

* `<NAME>` — Name of the view that should be created. This is distinct from `display_name`, which is not constrained
* `<DISPLAY_NAME>` — Display name of the view that should be created. This is distinct from `name`, which is constrained
* `<DESCRIPTION>` — Description of the view that should be created
* `<TIME_RANGE_VALUE>` — Time range value in either seconds, minutes, hours or days (without suffix). Used in conjunction with `time_range_unit`
* `<TIME_RANGE_UNIT>` — Time range unit. Used in conjunction with `time_range_value`

  Possible values: `seconds`, `minutes`, `hours`, `days`

* `<SORT_BY>` — What the notebooks displayed in the view should be sorted by, by default

  Possible values: `title`, `created-at`, `updated-at`

* `<SORT_DIRECTION>` — Sort direction displayed by default when opening the view

  Possible values: `ascending`, `descending`


###### **Options:**

* `--color <COLOR>` — The color the resulting view should be displayed as in Fiberplane Studio
* `-l`, `--labels <LABELS>` — Labels which are associated with this newly created view
* `-o`, `--output <OUTPUT>` — Output of the view

  Default value: `table`

  Possible values:
  - `table`:
    Output the details of the view as a table
  - `json`:
    Output the view as JSON




## `fp views list`

List views

**Usage:** `fp views list [OPTIONS]`

###### **Options:**

* `--sort-by <SORT_BY>` — Sort the result according to the following field

  Possible values: `name`, `display-name`, `description`, `labels`, `created-at`, `updated-at`

* `--sort-direction <SORT_DIRECTION>` — Sort the result in the following direction

  Possible values: `ascending`, `descending`

* `--page <PAGE>` — Page to display
* `--limit <LIMIT>` — Amount of views to display per page
* `-o`, `--output <OUTPUT>` — Output of the view

  Default value: `table`

  Possible values:
  - `table`:
    Output the details of the view as a table
  - `json`:
    Output the view as JSON




## `fp views delete`

Delete a view

**Usage:** `fp views delete [OPTIONS]`

###### **Options:**

* `--view-name <VIEW_NAME>` — Name of the view which should be deleted



## `fp views update`

Update an existing view

**Usage:** `fp views update [OPTIONS]`

###### **Options:**

* `--view-name <VIEW_NAME>` — Name of the view which should be updated
* `--display-name <DISPLAY_NAME>` — New display name for the view
* `--description <DESCRIPTION>` — New description for the view
* `--clear-description` — Whenever the existing description should be removed
* `--color <COLOR>` — New color for the view
* `--labels <LABELS>` — New labels for the view
* `--time-range-value <TIME_RANGE_VALUE>` — New time range value in either seconds, minutes, hours or days (without suffix) for the view. Used in conjunction with `time_range_unit`
* `--time-range-unit <TIME_RANGE_UNIT>` — New time range unit for the view. Used in conjunction with `time_range_value`

  Possible values: `seconds`, `minutes`, `hours`, `days`

* `--clear-time-range` — Whenever the existing time range should be removed
* `--sort-by <SORT_BY>` — What the notebooks displayed in the view should be newly sorted by, by default

  Possible values: `title`, `created-at`, `updated-at`

* `--clear-sort-by` — Whenever the existing sort by should be removed
* `--sort-direction <SORT_DIRECTION>` — New sort direction displayed by default when opening the view

  Possible values: `ascending`, `descending`

* `--clear-sort-direction` — Whenever the existing sort direction should be removed



## `fp triggers`

Interact with triggers

Triggers allow you to expose webhooks that will expand templates. This could be used for alertmanager, for example.

**Usage:** `fp triggers <COMMAND>`

###### **Subcommands:**

* `create` — Create a trigger
* `get` — Retrieve a trigger
* `delete` — Delete a trigger
* `list` — List all triggers
* `invoke` — Invoke a trigger webhook to create a notebook from the template



## `fp triggers create`

Create a trigger

**Usage:** `fp triggers create [OPTIONS]`

###### **Options:**

* `--title <TITLE>` — Name of the trigger
* `--template-name <TEMPLATE_NAME>` — Name of the template (already uploaded to Fiberplane)
* `--default-arguments <DEFAULT_ARGUMENTS>` — Default arguments to be passed to the template when the trigger is invoked Can be passed as a JSON object or as a comma-separated list of key=value pairs
* `-o`, `--output <OUTPUT>` — Output of the trigger

  Default value: `table`

  Possible values:
  - `table`:
    Output the result as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp triggers get`

Retrieve a trigger

**Usage:** `fp triggers get [OPTIONS] [TRIGGER_ID]`

###### **Arguments:**

* `<TRIGGER_ID>` — Trigger ID

###### **Options:**

* `-o`, `--output <OUTPUT>` — Output of the trigger

  Default value: `table`

  Possible values:
  - `table`:
    Output the result as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp triggers delete`

Delete a trigger

**Usage:** `fp triggers delete [TRIGGER_ID]`

###### **Arguments:**

* `<TRIGGER_ID>` — Trigger ID



## `fp triggers list`

List all triggers

**Usage:** `fp triggers list [OPTIONS]`

###### **Options:**

* `-o`, `--output <OUTPUT>` — Output of the triggers

  Default value: `table`

  Possible values:
  - `table`:
    Output the result as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp triggers invoke`

Invoke a trigger webhook to create a notebook from the template

**Usage:** `fp triggers invoke [OPTIONS] [TEMPLATE_ARGUMENTS]`

###### **Arguments:**

* `<TEMPLATE_ARGUMENTS>` — Values to inject into the template

###### **Options:**

* `-t`, `--trigger-id <TRIGGER_ID>` — Trigger ID
* `-s`, `--secret-key <SECRET_KEY>` — Secret Key (returned when the trigger is initially created)
* `-o`, `--output <OUTPUT>` — Output of the triggers

  Default value: `table`

  Possible values:
  - `table`:
    Output the result as a table
  - `json`:
    Output the result as a JSON encoded object




## `fp events`

Interact with events

Events allow you to mark a specific point in time when something occurred, such as a deployment.

**Usage:** `fp events <COMMAND>`

###### **Subcommands:**

* `create` — Create an event
* `search` — Search for an event
* `delete` — Delete an event



## `fp events create`

Create an event

**Usage:** `fp events create [OPTIONS]`

###### **Options:**

* `--title <TITLE>` — Name of the event
* `-l`, `--label <label>` — Labels to add to the events (you can specify multiple labels)
* `--time <TIME>` — Time at which the event occurred. Leave empty to use current time
* `-o`, `--output <OUTPUT>` — Output of the event

  Default value: `table`

  Possible values:
  - `table`:
    Output the details as a table
  - `json`:
    Output the details as JSON




## `fp events search`

Search for an event

**Usage:** `fp events search [OPTIONS] --start <START> --end <END>`

###### **Options:**

* `-l`, `--label <label>` — Labels to search events for (you can specify multiple labels)
* `--start <START>` — Start time to search for events for
* `--end <END>` — End time to search for events for
* `-o`, `--output <OUTPUT>` — Output of the event

  Default value: `table`

  Possible values:
  - `table`:
    Output the details as a table
  - `json`:
    Output the details as JSON

* `--sort-by <SORT_BY>` — Sort the result according to the following field

  Possible values: `title`, `occurrence-time`, `created-at`, `updated-at`

* `--sort-direction <SORT_DIRECTION>` — Sort the result in the following direction

  Possible values: `ascending`, `descending`

* `--page <PAGE>` — Page to display
* `--limit <LIMIT>` — Amount of events to display per page



## `fp events delete`

Delete an event

**Usage:** `fp events delete <ID>`

###### **Arguments:**

* `<ID>` — ID of the event that should be deleted



## `fp tokens`

Interact with API tokens

**Usage:** `fp tokens <COMMAND>`

###### **Subcommands:**

* `create` — Create a token
* `list` — Lists all tokens
* `delete` — Deletes a token



## `fp tokens create`

Create a token

**Usage:** `fp tokens create [OPTIONS] --name <NAME>`

###### **Options:**

* `--name <NAME>` — Name of the token
* `-o`, `--output <OUTPUT>` — Output of the token

  Default value: `table`

  Possible values:
  - `table`:
    Output the details as a table
  - `json`:
    Output the details as JSON
  - `token`:
    Output only the token




## `fp tokens list`

Lists all tokens

**Usage:** `fp tokens list [OPTIONS]`

###### **Options:**

* `-o`, `--output <OUTPUT>` — Output of the token

  Default value: `table`

  Possible values:
  - `table`:
    Output the details as a table
  - `json`:
    Output the details as JSON

* `--sort-by <SORT_BY>` — Sort the result according to the following field

  Possible values: `title`, `created-at`, `expires-at`

* `--sort-direction <SORT_DIRECTION>` — Sort the result in the following direction

  Possible values: `ascending`, `descending`

* `--page <PAGE>` — Page to display
* `--limit <LIMIT>` — Amount of events to display per page



## `fp tokens delete`

Deletes a token

**Usage:** `fp tokens delete <ID>`

###### **Arguments:**

* `<ID>` — ID of the token that should be deleted



## `fp update`

Update the current FP binary

**Usage:** `fp update [OPTIONS]`

###### **Options:**

* `-f`, `--force`



## `fp users`

Interact with user details

**Usage:** `fp users <COMMAND>`

###### **Subcommands:**

* `profile` — Get the profile of the current user



## `fp users profile`

Get the profile of the current user

**Usage:** `fp users profile [OPTIONS]`

###### **Options:**

* `-o`, `--output <OUTPUT>` — Output of the template

  Default value: `table`

  Possible values:
  - `table`:
    Output the details as a table
  - `json`:
    Output the details as JSON




## `fp workspaces`

Interact with workspaces

A workspace holds all notebooks, events and relays for a specific user or organization.

**Usage:** `fp workspaces <COMMAND>`

###### **Subcommands:**

* `create` — Create a new workspace
* `delete` — Delete a workspace
* `invites` — Create, list and delete invites for a workspace
* `list` — List all workspaces of which you're a member
* `leave` — Leave a workspace
* `settings` — Update workspace settings
* `users` — List, update and remove users from a workspace



## `fp workspaces create`

Create a new workspace

**Usage:** `fp workspaces create [OPTIONS]`

###### **Options:**

* `-n`, `--name <NAME>` — Unique name of the new workspace
* `-d`, `--display-name <DISPLAY_NAME>` — Display name of the new workspace
* `-o`, `--output <OUTPUT>` — Output of the workspace

  Default value: `table`

  Possible values:
  - `table`:
    Output the details as a table
  - `json`:
    Output the details as JSON




## `fp workspaces delete`

Delete a workspace

**Usage:** `fp workspaces delete`



## `fp workspaces invites`

Create, list and delete invites for a workspace

**Usage:** `fp workspaces invites <COMMAND>`

###### **Subcommands:**

* `create` — Create a new invitation to join a workspace
* `list` — List all pending invites for a workspace
* `delete` — Delete a pending invite from a workspace



## `fp workspaces invites create`

Create a new invitation to join a workspace

**Usage:** `fp workspaces invites create [OPTIONS] <email> [role]`

###### **Arguments:**

* `<email>` — Email address of the user which should be invited
* `<role>` — Role which the invited user should receive upon accepting the invite

  Default value: `write`

  Possible values: `read`, `write`, `admin`


###### **Options:**

* `-o`, `--output <OUTPUT>` — Output of the invite

  Default value: `table`

  Possible values:
  - `invite-url`:
    Output the details as plain text
  - `table`:
    Output the details as a table
  - `json`:
    Output the details as JSON




## `fp workspaces invites list`

List all pending invites for a workspace

**Usage:** `fp workspaces invites list [OPTIONS]`

###### **Options:**

* `-o`, `--output <OUTPUT>` — Output of the invites

  Default value: `table`

  Possible values:
  - `table`:
    Output the details as a table
  - `json`:
    Output the details as JSON

* `--sort-by <SORT_BY>` — Sort the result according to the following field

  Possible values: `id`, `sender`, `receiver`, `created-at`, `expires-at`

* `--sort-direction <SORT_DIRECTION>` — Sort the result in the following direction

  Possible values: `ascending`, `descending`

* `--page <PAGE>` — Page to display
* `--limit <LIMIT>` — Amount of events to display per page



## `fp workspaces invites delete`

Delete a pending invite from a workspace

**Usage:** `fp workspaces invites delete --invite-id <INVITE_ID>`

###### **Options:**

* `-i`, `--invite-id <INVITE_ID>` — Invitation ID to delete



## `fp workspaces list`

List all workspaces of which you're a member

**Usage:** `fp workspaces list [OPTIONS]`

###### **Options:**

* `-o`, `--output <OUTPUT>` — Output of the workspaces

  Default value: `table`

  Possible values:
  - `table`:
    Output the details as a table
  - `json`:
    Output the details as JSON

* `--sort-by <SORT_BY>` — Sort the result according to the following field

  Possible values: `name`, `type`, `joined-at`

* `--sort-direction <SORT_DIRECTION>` — Sort the result in the following direction

  Possible values: `ascending`, `descending`

* `--page <PAGE>` — Page to display
* `--limit <LIMIT>` — Amount of events to display per page



## `fp workspaces leave`

Leave a workspace

**Usage:** `fp workspaces leave`



## `fp workspaces settings`

Update workspace settings

**Usage:** `fp workspaces settings <COMMAND>`

###### **Subcommands:**

* `owner` — Move ownership of workspace to new owner
* `name` — Change name of workspace
* `default-data-sources` — Change the default data sources



## `fp workspaces settings owner`

Move ownership of workspace to new owner

**Usage:** `fp workspaces settings owner [OPTIONS]`

###### **Options:**

* `-o`, `--new-owner-id <NEW_OWNER_ID>` — ID of the member who should become workspace owner



## `fp workspaces settings name`

Change name of workspace

**Usage:** `fp workspaces settings name --new-name <NEW_NAME>`

###### **Options:**

* `-n`, `--new-name <NEW_NAME>` — New name for the workspace



## `fp workspaces settings default-data-sources`

Change the default data sources

**Usage:** `fp workspaces settings default-data-sources <COMMAND>`

###### **Subcommands:**

* `get` — Get the default data sources
* `set` — Set the default data source for the given provider type
* `unset` — Unset the default data source for the given provider type



## `fp workspaces settings default-data-sources get`

Get the default data sources

**Usage:** `fp workspaces settings default-data-sources get [OPTIONS]`

###### **Options:**

* `-o`, `--output <OUTPUT>` — Display format for the output

  Default value: `table`

  Possible values:
  - `table`:
    Output the details as a table
  - `json`:
    Output the details as JSON




## `fp workspaces settings default-data-sources set`

Set the default data source for the given provider type

**Usage:** `fp workspaces settings default-data-sources set [OPTIONS]`

###### **Options:**

* `-d`, `--data-source-name <DATA_SOURCE_NAME>` — Name of the data source which should be set as default for the given provider type
* `-p`, `--daemon-name <DAEMON_NAME>` — If the data source is an FPD data source, the name of the daemon



## `fp workspaces settings default-data-sources unset`

Unset the default data source for the given provider type

**Usage:** `fp workspaces settings default-data-sources unset [OPTIONS]`

###### **Options:**

* `-p`, `--provider-type <PROVIDER_TYPE>` — Provider type for which the default data source should be unset



## `fp workspaces users`

List, update and remove users from a workspace

**Usage:** `fp workspaces users <COMMAND>`

###### **Subcommands:**

* `list` — List the users that part of a workspace
* `update` — Update the user within a workspace
* `delete` — Delete a user from a workspace



## `fp workspaces users list`

List the users that part of a workspace

**Usage:** `fp workspaces users list [OPTIONS]`

###### **Options:**

* `-o`, `--output <OUTPUT>` — Output of the invites

  Default value: `table`

  Possible values:
  - `table`:
    Output the details as a table
  - `json`:
    Output the details as JSON

* `--sort-by <SORT_BY>` — Sort the result according to the following field

  Possible values: `name`, `email`, `joined-at`

* `--sort-direction <SORT_DIRECTION>` — Sort the result in the following direction

  Possible values: `ascending`, `descending`

* `--page <PAGE>` — Page to display
* `--limit <LIMIT>` — Amount of events to display per page



## `fp workspaces users update`

Update the user within a workspace

**Usage:** `fp workspaces users update [OPTIONS]`

###### **Options:**

* `--role <ROLE>` — New role which should be assigned to the specified user

  Possible values: `read`, `write`, `admin`

* `-u`, `--user-id <USER_ID>` — User ID of the user that should be updated within the workspace



## `fp workspaces users delete`

Delete a user from a workspace

**Usage:** `fp workspaces users delete [OPTIONS]`

###### **Options:**

* `-u`, `--user-id <USER_ID>` — User ID of the user that should be removed from the workspace



## `fp webhooks`

Interact with webhooks

Webhooks allow you to receive http requests from Fiberplane when certain events occur

**Usage:** `fp webhooks <COMMAND>`

###### **Subcommands:**

* `create` — Create a new webhook
* `list` — List all webhooks
* `delete` — Delete a webhook
* `update` — Update a webhook
* `deliveries` — View webhook deliveries and optionally resend them, if they errored



## `fp webhooks create`

Create a new webhook

**Usage:** `fp webhooks create [OPTIONS]`

###### **Options:**

* `--categories <CATEGORIES>` — List of categories which this new webhook should receive deliveries for

  Possible values: `ping`, `front-matter`

* `--endpoint <ENDPOINT>` — Endpoint URL to which deliveries should be sent to. Must start with `http` or `https`
* `--enabled <ENABLED>` — Whenever the newly created webhook should be enabled

  Possible values: `true`, `false`

* `-o`, `--output <OUTPUT>` — Output of the webhook

  Default value: `table`

  Possible values:
  - `table`:
    Output the details of the webhook as a table
  - `json`:
    Output the webhook as JSON




## `fp webhooks list`

List all webhooks

**Usage:** `fp webhooks list [OPTIONS]`

###### **Options:**

* `--page <PAGE>` — Page to display
* `--limit <LIMIT>` — Amount of webhooks to display per page
* `-o`, `--output <OUTPUT>` — Output of the webhooks

  Default value: `table`

  Possible values:
  - `table`:
    Output the details of the webhook as a table
  - `json`:
    Output the webhook as JSON




## `fp webhooks delete`

Delete a webhook

**Usage:** `fp webhooks delete [OPTIONS]`

###### **Options:**

* `--webhook-id <WEBHOOK_ID>` — Which webhook should be deleted



## `fp webhooks update`

Update a webhook

**Usage:** `fp webhooks update [OPTIONS]`

###### **Options:**

* `--webhook-id <WEBHOOK_ID>` — Which webhook should be updated
* `--endpoint <ENDPOINT>` — New endpoint url for the webhook
* `--categories <CATEGORIES>` — New categories for which the webhook should receive deliveries. Setting this option will override the already set categories with the passed ones

  Possible values: `ping`, `front-matter`

* `--regenerate-shared-secret` — Whenever the shared secret should be regenerated for this webhook

  Default value: `false`
* `--enabled <ENABLED>` — Whenever the webhook should be enabled and thus receive deliveries

  Possible values: `true`, `false`

* `-o`, `--output <OUTPUT>` — Output of the webhook

  Default value: `table`

  Possible values:
  - `table`:
    Output the details of the webhook as a table
  - `json`:
    Output the webhook as JSON




## `fp webhooks deliveries`

View webhook deliveries and optionally resend them, if they errored

**Usage:** `fp webhooks deliveries <COMMAND>`

###### **Subcommands:**

* `list` — List all deliveries
* `info` — Get detailed information about a delivery
* `resend` — Resend a delivery



## `fp webhooks deliveries list`

List all deliveries

**Usage:** `fp webhooks deliveries list [OPTIONS]`

###### **Options:**

* `--webhook-id <WEBHOOK_ID>` — For which webhook to display deliveries
* `--page <PAGE>` — Page to display
* `--limit <LIMIT>` — Amount of webhooks to display per page
* `-o`, `--output <OUTPUT>` — Output of the webhooks

  Default value: `table`

  Possible values:
  - `table`:
    Output the details of the webhook as a table
  - `json`:
    Output the webhook as JSON




## `fp webhooks deliveries info`

Get detailed information about a delivery

**Usage:** `fp webhooks deliveries info [OPTIONS]`

###### **Options:**

* `--webhook-id <WEBHOOK_ID>` — For which webhook to display delivery info
* `--delivery-id <DELIVERY_ID>` — For which delivery to display info
* `-o`, `--output <OUTPUT>` — Output of the delivery

  Default value: `table`

  Possible values:
  - `table`:
    Output the details of the delivery as a table
  - `json`:
    Output the delivery as JSON
  - `request-headers`:
    Output only the request headers
  - `request-body`:
    Output only the request body
  - `response-headers`:
    Output only the response headers
  - `response-body`:
    Output only the response body




## `fp webhooks deliveries resend`

Resend a delivery

**Usage:** `fp webhooks deliveries resend [OPTIONS]`

###### **Options:**

* `--webhook-id <WEBHOOK_ID>` — For which webhook to trigger a resend
* `--delivery-id <DELIVERY_ID>` — For which delivery to trigger a resend



## `fp integrations`

Interact with integrations

Integrations allow you to integrate various third-party tools into Fiberplane

**Usage:** `fp integrations <COMMAND>`

###### **Subcommands:**

* `list` — List all integrations



## `fp integrations list`

List all integrations

**Usage:** `fp integrations list [OPTIONS]`

###### **Options:**

* `--page <PAGE>` — Page to display
* `--limit <LIMIT>` — Amount of integrations to display per page
* `-o`, `--output <OUTPUT>` — Output of the webhooks

  Default value: `table`

  Possible values:
  - `table`:
    Output the details of the integrations as a table
  - `json`:
    Output the integration as JSON




## `fp version`

Display extra version information

**Usage:** `fp version [OPTIONS]`

###### **Options:**

* `-o`, `--output <OUTPUT>` — output type to use

  Default value: `version`

  Possible values:
  - `version`:
    Only display the version
  - `verbose`:
    Show all the build information
  - `json`:
    Show all the build information encoded as JSON




<hr/>

<small><i>
    This document was generated automatically by
    <a href="https://crates.io/crates/clap-markdown"><code>clap-markdown</code></a>.
</i></small>


