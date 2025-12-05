import '@/assets/shadcn.css';
import { Message } from '@/lib/message';
import { NODE_PROCESSED_DATA_KEY, waitFor } from "@/lib/utils";
import ReactDOM from "react-dom/client";
import { Fragment } from 'react/jsx-runtime';
import { ContentScriptContext } from "wxt/client";
import { Button } from "./ui/button";
import { throttle } from 'lodash-es';

export const SalesNavSearch = () => {
  const [isLoading, setIsLoading] = useState(false)
  const _onClick = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await browser.runtime.sendMessage({
        type: Message.exportSearchLeads,
      })
      if (res instanceof Object && 'error' in res) {
        throw new Error(res.error as string)
      }
    } catch (error: any) {
      console.error(error)
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [])
  return (
    <Fragment>
      <Button onClick={_onClick} disabled={isLoading}>
        {isLoading ? 'Please wait...' : 'Import leads'}
      </Button>
    </Fragment>
  )
}

const SELECTOR = 'div[class*=_sticky-nav] > div'

const isSalesNavSearchResultsPage = () =>
  /^\/sales\/search\/people/.test(window.location.pathname);

// export const _injectSalesNavSearch = async (ctx: ContentScriptContext) => {
//   if (!isSalesNavSearchResultsPage()) {
//     return;
//   }
//   const anchorEl = await waitFor(SALES_NAV_SEARCH_SELECTOR);
//   const existingUIs = document.querySelectorAll('fl-sales-nav-search');
//   existingUIs.forEach((ui) => ui.remove());

//   const ui = await createShadowRootUi(ctx, {
//     name: "fl-sales-nav-search",
//     position: 'inline',
//     anchor: anchorEl,
//     onMount(container) {
//       const appContainer = document.createElement("div");
//       appContainer.id = "fl_sales_nav_search_root";
//       container.appendChild(appContainer);

//       const root = ReactDOM.createRoot(appContainer);
//       root.render(
//         <SalesNavSearch />
//       );
//       return root;
//     },
//     onRemove(root) {
//       root?.unmount();
//     }
//   })
//   ui.mount();
// }


export const injectSalesNavSearch = async (ctx: ContentScriptContext) => {
  if (!isSalesNavSearchResultsPage()) return;
  console.log('[injectSalesNavSearch] called')

  const node = document.querySelector(SELECTOR) as HTMLElement;

  if (!node) return;

  if (node.dataset[NODE_PROCESSED_DATA_KEY]) return;
  node.dataset[NODE_PROCESSED_DATA_KEY] = "1";

  const ui = await createShadowRootUi(ctx, {
    name: "fl-sales-nav-search",
    position: 'inline',
    anchor: node,
    onMount(container) {
      const appContainer = document.createElement("div");
      appContainer.id = "fl_sales_nav_search_root";
      container.appendChild(appContainer);

      const root = ReactDOM.createRoot(appContainer);
      root.render(
        <SalesNavSearch />
      );
      return root;
    },
    onRemove(root) {
      root?.unmount();
    }
  })
  ui.mount();
}


export const throttledInjectSalesNavSearch = throttle(injectSalesNavSearch, 250);
