export default {
  rootDir: ".",
  roots: ["<rootDir>/src"],
  testMatch: ["<rootDir>/src/**/*.test.{js,ts}"],
  transform: {
    "^.+\\.(js|ts)$": "@swc/jest",
  },
  moduleFileExtensions: ["ts", "js", "json"],
};
