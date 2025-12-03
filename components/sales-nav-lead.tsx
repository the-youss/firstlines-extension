import '@/assets/shadcn.css';
import { waitFor } from "@/lib/utils";
import ReactDOM from "react-dom/client";
import { ContentScriptContext } from "wxt/client";
import { Button } from "./ui/button";

export const SalesNavLead = () => {
  const _onClick = useCallback(() => {
    browser.runtime.sendMessage({
      type: 'export-leads',
    })
  }, [])
  return (
    <Button onClick={_onClick}>
      Export leads
    </Button>
  )
}

const SALES_NAV_LEAD_SELECTOR = '#profile-card-section div[class*=_cta-container_]'
const isSalesNavProfilePage = () =>
  /^\/sales\/lead\//.test(window.location.pathname);
const isSalesNavSearchResultsPage = () =>
  /^\/sales\/search\/people/.test(window.location.pathname);


export const injectSalesNavLead = async (ctx: ContentScriptContext) => {
  if (!isSalesNavProfilePage() && !isSalesNavSearchResultsPage()) {
    return;
  }
  const anchorEl = await waitFor(SALES_NAV_LEAD_SELECTOR);
  const ui = await createShadowRootUi(ctx, {
    name: "fl-button",
    position: 'inline',
    anchor: anchorEl,
    onMount(container) {
      const root = ReactDOM.createRoot(container);
      root.render(
        <SalesNavLead />
      );
      return root;
    },
    onRemove(root) {
      root?.unmount();
    }
  })
  ui.mount();
}
