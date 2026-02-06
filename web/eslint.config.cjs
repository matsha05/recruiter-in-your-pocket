const nextConfig = require("eslint-config-next/core-web-vitals");

module.exports = [
  ...nextConfig,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off"
    }
  },
  {
    ignores: [
      "components/landing-showcase/**",
      "app/internal/**",
      ".next/**",
      "node_modules/**",
      "test-results/**"
    ]
  }
];
