import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        miniflare: {
          compatibilityFlags: [
          ],
          compatibilityDate: "2023-10-01"
        },
        wrangler: {},
      },
    },
  },
});
