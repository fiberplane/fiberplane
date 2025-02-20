import { OGImageRoute } from "astro-og-canvas";

type OGImageOptions = Omit<
  Awaited<
    ReturnType<Parameters<typeof OGImageRoute>[number]["getImageOptions"]>
  >,
  "title" | "description"
>;

export const ogImageOptions: OGImageOptions = {
  bgImage: {
    path: "./src/assets/og-bg.png",
    position: "center",
    fit: "cover"
  },
  logo: {
    path: "./src/assets/fp-logo-dark.png",
    size: [534, 100]
  },
  font: {
    title: {
      size: 56,
      families: ["Instrument Sans"]
    },
    description: {
      size: 32,
      families: ["Geist"]
    }
  },
  padding: 60,
  fonts: [
    "./src/assets/_fonts/Geist-Light.ttf",
    "./src/assets/_fonts/InstrumentSans-SemiBold.ttf"
  ]
};
