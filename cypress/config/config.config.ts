import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('../plugins/index.js')(on, config)
    },
    defaultCommandTimeout: 90000,
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
})
