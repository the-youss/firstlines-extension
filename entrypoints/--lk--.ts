// @ts-nocheck
import { EVENT_NAME } from "@/lib/event.name";
import { urlsToWatch } from "@/lib/utils";

export default defineUnlistedScript(() => {
  init();
  console.log("watching...");
});


function init() {

  (function () {
    // --- XHR override ---
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      this._url = url; // store url for later
      this._method = method;
      return originalXhrOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function (body) {
      if (
        this._url &&
        urlsToWatch.findIndex((url) => this._url.includes(url)) != -1
      ) {
        let parsedBody = body;

        if (body) {
          if (typeof body === "string") {
            try {
              parsedBody = JSON.parse(body);
            } catch { }
          } else if (body instanceof FormData) {
            const obj = {};
            for (const [k, v] of body.entries()) obj[k] = v;
            parsedBody = obj;
          }
        }
        window.postMessage(
          {
            type: EVENT_NAME.SL_LINKEDIN_API_REQUEST,
            url: this._url,
            method: this._method,
            body: parsedBody,
          },
          "*"
        );
      }

      return originalXhrSend.apply(this, [body]);
    };
  })();
}