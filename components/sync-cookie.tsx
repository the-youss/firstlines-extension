import { Message } from "@/lib/message"
import { storageFn } from "@/lib/storage"
import { waitFor } from "@/lib/utils"
import { createRoot } from "react-dom/client"
import { Fragment } from "react/jsx-runtime"
import { ContentScriptContext } from "wxt/client"


const SYNC_COOKIE_INTERVAL = 30 * 60 * 1000; // 30 minutes in ms

export const SyncCookie = () => {
  useEffect(() => {
    const run = async () => {
      const now = Date.now()
      const stored = await storageFn.get('__FL_LK__LAST_SYNC_TIME');
      const lastSyncTime = stored ? Number(stored) : 0;
      console.log('[sync]', new Date(now).toLocaleString())
      const shouldSync = now - lastSyncTime >= SYNC_COOKIE_INTERVAL;
      if (!shouldSync) return;
      try {
        await browser.runtime.sendMessage({
          type: Message.syncLinkedinSession,
        });
      } catch (error) {
        console.error('[sync error]', error);
      } finally {
        await storageFn.save('__FL_LK__LAST_SYNC_TIME', now.toString());
      }
    }
    run();
    const timer = setTimeout(run, SYNC_COOKIE_INTERVAL)

    return () => clearInterval(timer);
  }, [])
  return (
    <Fragment />
  )
}
const SALES_NAV_SEARCH_SELECTOR = 'body'

const isSalesNavSearchResultsPage = () =>
  /^\/sales\/search\/people/.test(window.location.pathname);

export const injectSyncCookie = async (ctx: ContentScriptContext) => {
  if (!isSalesNavSearchResultsPage()) {
    return;
  }
  const anchorEl = await waitFor(SALES_NAV_SEARCH_SELECTOR);
  const existingUIs = document.querySelectorAll('fl-sync');
  existingUIs.forEach((ui) => ui.remove());

  const ui = await createShadowRootUi(ctx, {
    name: "fl-sync",
    position: 'inline',
    anchor: anchorEl,
    onMount(container) {
      const appContainer = document.createElement("div");
      appContainer.id = "fl_sync";
      container.appendChild(appContainer);

      const root = createRoot(appContainer);
      root.render(
        <SyncCookie />
      );
      return root;
    },
    onRemove(root) {
      root?.unmount();
    }
  })
  ui.mount();
}