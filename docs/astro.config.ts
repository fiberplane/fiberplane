import starlight from "@astrojs/starlight";
import markdownIntegration from "@astropub/md";
import pagefind from "astro-pagefind";
import { defineConfig } from "astro/config";
import { mermaid } from "./integrations/astro-mermaid";

// https://astro.build/config
export default defineConfig({
  redirects: {
    "/": "/docs",
  },
  server: {
    port: 1111,
  },
  markdown: {
    remarkPlugins: [mermaid],
  },
  integrations: [
    pagefind(),
    markdownIntegration(),
    starlight({
      title: "Fiberplane Docs",
      logo: {
        light: "@assets/logo/fiberplane_logo_black.svg",
        dark: "@assets/logo/fiberplane_logo_white.svg",
        replacesTitle: true,
      },
      social: {
        github: "https://github.com/fiberplane/fiberplane",
      },
      components: { Footer: "@components/Footer.astro" },
      sidebar: [
        {
          label: "Start Here",
          items: [
            {
              label: "Quickstart",
              link: "/docs/quickstart",
            },
            {
              label: "FAQ",
              link: "/docs/faq",
            },
          ],
        },
        {
          label: "Templates",
          autogenerate: {
            directory: "docs/templates",
          },
        },
        {
          label: "Providers",
          autogenerate: {
            directory: "docs/providers",
          },
        },
        {
          label: "Webhooks",
          autogenerate: {
            directory: "docs/webhooks",
          },
        },
        {
          label: "CLI",
          autogenerate: {
            directory: "docs/cli",
          },
        },
        {
          label: "Reference",
          items: [
            {
              label: "Notebooks",
              link: "/docs/reference/notebooks",
            },
            {
              label: "Templates",
              link: "/docs/reference/templates",
            },
            {
              label: "Command Line Interface",
              link: "/docs/reference/cli",
            },
          ],
        },
        {
          label: "API Reference",
          items: [
            {
              label: "Events",
              link: "/docs/reference/api/events",
            },
            {
              label: "Integrations",
              link: "/docs/reference/api/integrations",
            },
            {
              label: "Notebooks",
              link: "/docs/reference/api/notebooks",
            },
            {
              label: "Templates",
              link: "/docs/reference/api/templates",
            },
            {
              label: "Triggers",
              link: "/docs/reference/api/triggers",
            },
            {
              label: "Webhooks",
              link: "/docs/reference/api/webhooks",
            },
            {
              label: "Workspaces",
              link: "/docs/reference/api/workspaces",
            },
          ],
        },
      ],
    }),
  ],
});
