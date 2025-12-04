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
      Import lead
    </Button>
  )
}
const SELECTOR_SALES_NAV_SEARCH_RESULTS_PROFILE_CONTAINER = "#inline-sidesheet-outlet";
const SALES_NAV_LEAD_SELECTOR = '#profile-card-section div[class*=_cta-container_]'
let mutationOnCtaContainerObserver: MutationObserver | undefined;
let mutationOnSearchResultsProfilecontainerObserver:
  | MutationObserver
  | undefined;
const isSalesNavProfilePage = () =>
  /^\/sales\/lead\//.test(window.location.pathname);
const isSalesNavSearchResultsPage = () =>
  /^\/sales\/search\/people/.test(window.location.pathname);

const tag = 'fl-sales-nav-lead'
let isInjectingSalesNavLead = false;

export const injectSalesNavLead = async (ctx: ContentScriptContext) => {
  if (isInjectingSalesNavLead) return;

  if (!isSalesNavProfilePage() && !isSalesNavSearchResultsPage()) return;

  // already injected?
  if (document.querySelector(tag)) return;

  isInjectingSalesNavLead = true;
  try {
    const anchorEl = await waitFor(SALES_NAV_LEAD_SELECTOR);

    // double-check before inserting
    if (document.querySelector(tag)) return;
    const ui = await createShadowRootUi(ctx, {
      name: "fl-sales-nav-lead",
      position: "inline",
      append(anchor, ui) {
        anchor.prepend(ui);
      },
      anchor: anchorEl.parentElement,
      onMount(container) {
        const appContainer = document.createElement("div");
        appContainer.id = "fl_sales_nav_lead_root";
        appContainer.style.marginRight = "12px";
        container.appendChild(appContainer);

        const root = ReactDOM.createRoot(appContainer);
        root.render(<SalesNavLead />);
        return root;
      },
      onRemove(root) {
        root?.unmount();
      },
    });

    ui.mount();

  } finally {
    isInjectingSalesNavLead = false;
  }

  // handle search results mutation reinjection
  if (isSalesNavSearchResultsPage()) {
    const searchResultsContainerElem = document.querySelector(
      SELECTOR_SALES_NAV_SEARCH_RESULTS_PROFILE_CONTAINER
    );

    if (searchResultsContainerElem) {
      if (mutationOnSearchResultsProfilecontainerObserver)
        mutationOnSearchResultsProfilecontainerObserver.disconnect();

      mutationOnSearchResultsProfilecontainerObserver = new MutationObserver(() => {
        // We only re-inject if UI is gone
        if (!document.querySelector("fl-sales-nav-lead")) {
          injectSalesNavLead(ctx);
        }
      });

      mutationOnSearchResultsProfilecontainerObserver.observe(
        searchResultsContainerElem,
        { childList: true, subtree: true }
      );
    }
  }
};

