export default {
    rootDir: ".",
    roots: ["<rootDir>/src"],
    testMatch: ["<rootDir>/src/**/*.test.{js,jsx,ts,tsx}"],
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "@swc/jest",
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
