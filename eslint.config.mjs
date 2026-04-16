export default [
  {
    ignores: ["node_modules/**", ".next/**", "dist/**", "build/**", "*.js", "*.mjs"],
  },
  {
    rules: {
      "no-unused-vars": "off",
      "no-console": "off",
    },
  },
];