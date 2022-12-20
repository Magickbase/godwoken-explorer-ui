import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config)
      return config
    },
    specPattern: 'cypress/integration/**/*.spec.ts',
    testIsolation: false,
  },
  env: {
    EXPLORER_TITLE: 'GwScan',
    codeCoverage: {
      url: '/api/__coverage__',
    },
  },
  defaultCommandTimeout: 24000,
  responseTimeout: 16000,
  pageLoadTimeout: 24000,
  viewportWidth: 1100,
  viewportHeight: 1000,
  projectId: '2sb35d',
})
