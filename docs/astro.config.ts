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
      title: "Fiberplane",
      social: {
        github: "https://github.com/withastro/starlight",
      },
      components: {
        Header: "@components/Header.astro",
      },
      sidebar: [
        {
          label: "Guides",
          autogenerate: { directory: "docs/guides" },
        },
      ],
    }),
  ],
});
