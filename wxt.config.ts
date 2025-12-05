import { defineConfig } from 'wxt';
import pkg from './package.json'
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
    name: pkg.name,
    description: pkg.description,
    version: pkg.version
  },
  modules: ['@wxt-dev/module-react'],

});
