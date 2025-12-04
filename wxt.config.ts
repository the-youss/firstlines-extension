import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifestVersion: 3,
  manifest: {
    host_permissions: [
      "*://*.linkedin.com/*",
      "*://*.firstlines.ai/*",
      "*://localhost/"
    ],
    web_accessible_resources: [
      {
        resources: ["--lk--.js"],
        matches: ["*://*.linkedin.com/*"]
      },
      {
        resources: ["assets/global.css"],
        matches: ["*://*.linkedin.com/*"]
      },
    ],
    permissions: [
      "activeTab",
      "cookies",
      "tabs",
      "webRequest",
      "storage"
    ],
    action: {},
    name: 'Test',
    description: 'Test',
  },
  modules: ['@wxt-dev/module-react'],

});
