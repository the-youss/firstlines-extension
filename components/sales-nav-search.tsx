import '@/assets/shadcn.css';
import { waitFor } from "@/lib/utils";
import ReactDOM from "react-dom/client";
import { ContentScriptContext } from "wxt/client";
import { Button } from "./ui/button";

export const SalesNavSearch = () => {
  const _onClick = useCallback(() => {
    browser.runtime.sendMessage({
      type: 'export-search-leads',
    })
  }, [])
  return (
    <Button onClick={_onClick}>
      Export leads
    </Button>
  )
}

export const SALES_NAV_SEARCH_SELECTOR = 'div[class*=_sticky-nav] > div'


export const injectSalesNavSearch = async (ctx: ContentScriptContext) => {
  const anchorEl = await waitFor(SALES_NAV_SEARCH_SELECTOR);
  const existingUIs = document.querySelectorAll('fl-sales-nav-search');
  existingUIs.forEach((ui) => ui.remove());

  const ui = await createShadowRootUi(ctx, {
    name: "fl-sales-nav-search",
    position: 'inline',
    anchor: anchorEl,
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
