const js = require("@eslint/js");
const reactPlugin = require("eslint-plugin-react");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const jsxA11yPlugin = require("eslint-plugin-jsx-a11y");
const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "**/build/**",
      "**/dist/**",
      "**/coverage/**",
      "**/*.min.js",
      "**/*.zip",
      "**/*.mongodb.js",
      "**/playground-*.js",
      "**/*.json",
      "**/*.lottie",
      "**/.backups/**",
      "**/.backups/**/*",
      ".backups/**",
      ".backups/**/*",
    ],
  },
  js.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    plugins: {
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "react/no-unknown-property": ["error", { ignore: ["cmdk-input-wrapper"] }],
      "no-unused-vars": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "react/no-unknown-property": ["error", { ignore: ["cmdk-input-wrapper"] }],
      "no-unused-vars": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
