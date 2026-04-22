/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/{e2e,feature}/**/*.test.ts"],
  globalSetup: "<rootDir>/setup/globalSetup.ts",
  globalTeardown: "<rootDir>/setup/globalTeardown.ts",
  testTimeout: 120000,
  maxWorkers: 1,
  reporters: ["default", ["jest-junit", { outputDirectory: "<rootDir>/test-results", outputName: "e2e-junit.xml" }]],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
};
