import sharedConfig from "./.shared/eslint.config.mjs";

export default [
  ...sharedConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off"
    }
  }
]
