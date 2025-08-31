/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/jsx-runtime",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect", // tự động nhận version React
    },
  },
  plugins: ["react", "@typescript-eslint", "react-hooks"],
  rules: {
    "react/jsx-no-target-blank": "off",
    "no-unused-vars": "off", // thay bằng rule của TS
    "@typescript-eslint/no-unused-vars": ["warn"],
    "no-debugger": "off",
    "react/prop-types": "off", // không cần khi dùng TS
    "react-refresh/only-export-components": [
      "warn",
      {
        allowConstantExport: true,
      },
    ],
  },
};
