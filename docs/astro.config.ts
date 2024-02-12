import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import vue from "@astrojs/vue";

export default defineConfig({
  server: {
    port: 1111,
  },
  integrations: [
    vue(),
    starlight({
      title: "Fiberplane Docs",
      logo: {
        light: "@assets/fiberplane_logo_black.svg",
        dark: "@assets/fiberplane_logo_white.svg",
        replacesTitle: true,
      },
      social: {
        github: "https://github.com/fiberplane/fiberplane",
      },
      components: {
        Header: "@components/Header.astro",
      },

      sidebar: [
        { label: "Quickstart", link: "/docs/quickstart" },
        { label: "Inviting users", link: "/docs/quickstart" },
        { label: "Deploying to Docker", link: "/docs/quickstart" },
        { label: "Integrations", autogenerate: { directory: "docs/integrations" } },
        { label: "Templates", autogenerate: { directory: "docs/templates" } },
        { label: "Providers", autogenerate: { directory: "docs/providers" } },
        {
          label: "Reference",
          items: [
            { label: "Notebooks", link: "/docs/reference/notebooks" },
            { label: "Templates", link: "/docs/reference/templates" },
            { label: "Command Line Interface", link: "/docs/reference/cli" },
            { label: "API", link: "/docs/reference/api" },
          ],
        },
        //   {
        //     label: "Getting Started",
        //
        //     autogenerate: { directory: "docs" },
        //   },
      ],
    }),
  ],
});
