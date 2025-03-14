const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    testIsolation: false,

  },
  env: {
    "api_url": "https://rbt-backend.azurewebsites.net",
    "password": "Password123$"
}
});
