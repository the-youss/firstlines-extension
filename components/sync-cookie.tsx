import { Message } from "@/lib/message"
import { storageFn } from "@/lib/storage"
import { NODE_PROCESSED_DATA_KEY, waitFor } from "@/lib/utils"
import { throttle } from "lodash-es"
import { createRoot } from "react-dom/client"
import { Fragment } from "react/jsx-runtime"
import { ContentScriptContext } from "wxt/client"


const SYNC_COOKIE_INTERVAL = 30 * 60 * 1000; // 30 minutes in ms

export const SyncCookie = () => {
  useEffect(() => {
    const run = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const isFromApp = searchParams.get('from') === 'fl_lk_status_check';
      const now = Date.now()
      const stored = await storageFn.get('__FL_LK__LAST_SYNC_TIME');
      const lastSyncTime = stored ? Number(stored) : 0;
      console.log('[sync]', new Date(now).toLocaleString(),)
      const shouldSync = isFromApp ? true : now - lastSyncTime >= SYNC_COOKIE_INTERVAL;
      if (!shouldSync) return;
      try {
        await browser.runtime.sendMessage({
          type: Message.syncLinkedinSession,
        });
      } catch (error) {
        console.error('[sync error]', error);
      } finally {
        await storageFn.save('__FL_LK__LAST_SYNC_TIME', now.toString());
        if (isFromApp) {
          alert(`LinkedIn session synced successfully!`)
          window.close()
        }
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
const SELECTOR = 'body'


export const injectSyncCookie = async (ctx: ContentScriptContext) => {
  console.log('[injectSyncCookie] called')

  const node = document.querySelector(SELECTOR) as HTMLElement;

  if (!node) return;
  if (node.dataset[NODE_PROCESSED_DATA_KEY]) return;
  node.dataset[NODE_PROCESSED_DATA_KEY] = "1";

  const ui = await createShadowRootUi(ctx, {
    name: "fl-sync",
    position: 'inline',
    anchor: node,
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

export const throttledInjectSyncCookie = throttle(injectSyncCookie, 250);
