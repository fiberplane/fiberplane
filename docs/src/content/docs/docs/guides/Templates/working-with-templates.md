---
title: Working with templates
---

> ⚠️ Note
>
> To work with templates you will need to have the Fiberplane CLI
> installed. See: [CLI](doc:cli).

The easiest way to get started with the template is create the structure you want in the Notebook and then in the top right corner click "Share > Download as Template”

This will download the existing notebook with the content saved as a Jsonnet file. Alternatively you can use the `fp templates init` CLI command to generate an empty template in your current directory

You can then edit the template using a text editor of your choice. Save the template as a Jsonnet file once you’re happy with it!

## Adding templates to your Fiberplane account

You will need to add your template to your workspace to start using it in Fiberplane. To add the template run the following command in your terminal (See [CLI](doc:cli), to get started with the Fiberplane CLI):

```bash
fp templates create /path/to/template.jsonnet
```

The `fp templates create` command wil then ask you to provide the title and
description of your template, and will add the template to your Fiberplane account.

You can verify that the template is added by listing out all of your templates with `fp templates list` or by navigating to your Fiberplane home screen’s *Templates* tab.

## Updating templates

If you have made changes to your Template that you want to upload to Fiberplane you can run the following command:

```bash
fp templates update --template-path /path/to/template.jsonnet
```

The command will fetch a list of current templates and ask you which template you want to update and overwrite.

## Removing templates

If you have a template you would like to remove from your gallery, run the following command passing the ID of your template as an argument:

```bash
fp templates remove 
```

These are the basic functions to get you started with Templates in Fiberplane.  To see the full reference of available CLI commands see CLI reference.
