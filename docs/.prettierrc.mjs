/** @type {import("prettier").Config} */
export default {
  useTabs: false,
  proseWrap: "never",
  tabWidth: 2,
  plugins: ["prettier-plugin-astro"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
