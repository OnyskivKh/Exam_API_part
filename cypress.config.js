const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    watchForFileChanges: false,
    viewportWidth: 1920,
    viewportHeight: 1080,
    experimentalMemoryManagement: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
