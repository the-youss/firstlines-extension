import '@/assets/shadcn.css';
import { waitFor } from "@/lib/utils";
import ReactDOM from "react-dom/client";
import { ContentScriptContext } from "wxt/client";
import { Button } from "./ui/button";
import { ComboBox } from './ui/combo-box';
const options = [
  {
    value: "backlog",
    label: "Backlog",
  },
  {
    value: "todo",
    label: "Todo",
  },
  {
    value: "in progress",
    label: "In Progress",
  },
  {
    value: "done",
    label: "Done",
  },
  {
    value: "canceled",
    label: "Canceled",
  },
]
export const SalesNavLead = ({ container }: { container: HTMLElement }) => {
  const _onClick = useCallback(() => {
    browser.runtime.sendMessage({
      type: 'export-leads',
    })
  }, [])
  const salesNavLeadEl = document.querySelector('fl-sales-nav-lead') as HTMLElement;
  const shadowRoot = container?.shadowRoot;
  console.log('shadowRoot', container)


  return (
    <ComboBox options={options} shadowRoot={container!}>
      {({ selectedOption }) => (
        <Button onClick={_onClick}>
          Import lead
        </Button>
      )}
    </ComboBox>

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
    console.log('anchorEl', anchorEl)

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
        appContainer.style.position = "relative";
        container.appendChild(appContainer);

        const root = ReactDOM.createRoot(appContainer);
        root.render(<SalesNavLead container={appContainer} />);
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

