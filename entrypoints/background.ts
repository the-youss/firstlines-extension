import { exportSearchLeads } from "@/lib/background-fn";
import { storageFn } from "@/lib/storage";
import { urlsToWatch } from "@/lib/utils";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const MESSAGE_TYPE = (message as { type: string }).type;
    console.log('MESSAGE_TYPE', MESSAGE_TYPE);
    if (MESSAGE_TYPE === 'export-search-leads') {
      exportSearchLeads().then(sendResponse)
    }

    return true;
  })

  browser.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      if (details.requestHeaders && urlsToWatch.findIndex((url) => details.url.includes(url)) != -1) {
        const requestIntercept = {
          timestamp: new Date().toISOString(),
          url: details.url,
          method: details.method,
          requestId: details.requestId,
          headers:
            details.requestHeaders.map((header) => ({
              name: header.name,
              value: header.value || "",
            }))
        };
        storageFn.save('__FL_LK__REQUEST_HEADERS', requestIntercept);
      }
    },
    { urls: ["*://www.linkedin.com/*"] },
    ["requestHeaders", "extraHeaders"]
  );



});
