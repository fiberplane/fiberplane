# Fiberplane Docs

This is the source code for our docs site available on fiberplane.com/docs

It includes the written guides as well as references generated directly from the OpenAPI spec. The CLI and template references are for now directly copied from their respective folders - this will be updated to follow a similar pattern to be automatically generated from the source code later.

### Architecture overview

The documentation site is an entirely static Astro site that uses Starlight framework for organizing and rendering documentation. Starlight framework provides very simple and good defaults for a documentation site: an interface for managing the sidebar and table of contents on each page, a search (built on Pagefind tool) that works out of the box, and a styling system that is accessible and looks good by default.

The entire site is hosted in the docs/ URL subdirectory on the fiberplane.com distribution alongside our Framer-hosted site. This is why you will find some of the files live in a somewhat awkward docs/docs/ subdirectory - this is a work around to ensure that all markdown pages render on `fiberplane.com/docs`

The site renders the documentation from two sources:

Markdown files that are in the `src/content/docs/` subdirectory. These are pretty straightforward and they just render according to Starlight's conventions. As mentioned earlier the CLI and Templates reference are for now just these markdown files placed in their respective directories.

The OpenAPI spec that is rendered dynamically. This uses the underlying Astro's file-based routing engine to parse the openapi_v1.yml file and render the pages for each resource. For this, an in-house component had to be rolled.

### How OpenAPI documentation is rendered

The documentation is organized using the `tags` properties in the OpenAPI spec. Each tag corresponds with what we would consider a "resource" in Fiberplane: notebooks, templates, workspaces, events etc.
Each tag then has a number of operations associated that are rendered in a single large page that is ctrl/cmd-f'able along with necessary path, request body parameters, and return schemas. Every path and operation makes use of the description property on the OpenAPI spec to render a rich markdown-supported documentation. The next phase in this project will entail a revision of the OpenAPI spec to ensure more of the relevant paths/parameters are better documented.
