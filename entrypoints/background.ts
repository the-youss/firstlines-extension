import { api } from "@/lib/api";
import { exportSearchLeads, getLinkedinCookies, importSingleProfile, syncLinkedinSession } from "@/lib/background-fn";
import { Message } from "@/lib/message";
import { storageFn } from "@/lib/storage";
import { preloadStorage } from "@/lib/use-store";
import { urlsToWatch } from "@/lib/utils";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const MESSAGE_TYPE = (message as { type: string }).type;
    const INPUT = (message as { input: any }).input;
    console.log('MESSAGE_TYPE', MESSAGE_TYPE);
    if (MESSAGE_TYPE === Message.exportSearchLeads) {
      exportSearchLeads().then(sendResponse).catch((error) => sendResponse({ error: error.message }))
    }
    if (MESSAGE_TYPE === Message.getLinkedinCookies) {
      getLinkedinCookies().then(sendResponse)
    }
    if (MESSAGE_TYPE === Message.syncLinkedinSession) {
      syncLinkedinSession().then(sendResponse).catch((error) => sendResponse({ error: error.message }))
    }

    if (MESSAGE_TYPE === Message.fetchLists) {
      api.getLists().then(sendResponse).catch((error) => sendResponse({ error: error.message }))
    }
    if (MESSAGE_TYPE === Message.importSingleProfile) {
      importSingleProfile(INPUT).then(sendResponse).catch((error) => sendResponse({ error: error.message }))
    }
    if (MESSAGE_TYPE === Message.preloadStorage) {
      preloadStorage().then(sendResponse)
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
