import '@/assets/shadcn.css';
import { NODE_PROCESSED_DATA_KEY } from "@/lib/utils";
import ReactDOM from "react-dom/client";
import { ContentScriptContext } from "wxt/client";
import { Button } from "./ui/button";
import { ListComboBox } from './list-combo-box';
import { throttle } from 'lodash-es';
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
  const _onSelect = useCallback((listId: string | 'new-list') => {
    let listName: string = ''
    if (listId === 'new-list') {
      listName = window.prompt('Enter list name') || ''
    }
  }, [])


  return (
    <ListComboBox shadowRoot={container!} onSelect={_onSelect}>
      <Button>
        Import lead
      </Button>
    </ListComboBox>

  )
}
const SELECTOR_SALES_NAV_SEARCH_RESULTS_PROFILE_CONTAINER = "#inline-sidesheet-outlet";
const SELECTOR = '#profile-card-section div[class*=_cta-container_]'

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

// export const _injectSalesNavLead = async (ctx: ContentScriptContext) => {
//   if (isInjectingSalesNavLead) return;

//   if (!isSalesNavProfilePage() && !isSalesNavSearchResultsPage()) return;

//   // already injected?
//   if (document.querySelector(tag)) return;

//   isInjectingSalesNavLead = true;
//   try {
//     const anchorEl = await waitFor(SALES_NAV_LEAD_SELECTOR);
//     console.log('anchorEl', anchorEl)

//     // double-check before inserting
//     if (document.querySelector(tag)) return;
//     const ui = await createShadowRootUi(ctx, {
//       name: "fl-sales-nav-lead",
//       position: "inline",
//       append(anchor, ui) {
//         anchor.prepend(ui);
//       },
//       anchor: anchorEl.parentElement,
//       onMount(container) {
//         const appContainer = document.createElement("div");
//         appContainer.id = "fl_sales_nav_lead_root";
//         appContainer.style.marginRight = "12px";
//         appContainer.style.position = "relative";
//         container.appendChild(appContainer);

//         const root = ReactDOM.createRoot(appContainer);
//         root.render(<SalesNavLead container={appContainer} />);
//         return root;
//       },
//       onRemove(root) {
//         root?.unmount();
//       },
//     });

//     ui.mount();

//   } finally {
//     isInjectingSalesNavLead = false;
//   }

//   // handle search results mutation reinjection
//   if (isSalesNavSearchResultsPage()) {
//     const searchResultsContainerElem = document.querySelector(
//       SELECTOR_SALES_NAV_SEARCH_RESULTS_PROFILE_CONTAINER
//     );

//     if (searchResultsContainerElem) {
//       if (mutationOnSearchResultsProfilecontainerObserver)
//         mutationOnSearchResultsProfilecontainerObserver.disconnect();

//       mutationOnSearchResultsProfilecontainerObserver = new MutationObserver(() => {
//         // We only re-inject if UI is gone
//         if (!document.querySelector("fl-sales-nav-lead")) {
//           injectSalesNavLead(ctx);
//         }
//       });

//       mutationOnSearchResultsProfilecontainerObserver.observe(
//         searchResultsContainerElem,
//         { childList: true, subtree: true }
//       );
//     }
//   }
// };

export const injectSalesNavLead = async (ctx: ContentScriptContext) => {

  if (!isSalesNavProfilePage() && !isSalesNavSearchResultsPage()) return;
  console.log('[injectSalesNavLead] called')

  const node = document.querySelector(SELECTOR) as HTMLElement;

  if (!node) return;

  if (node.dataset[NODE_PROCESSED_DATA_KEY]) return;
  node.dataset[NODE_PROCESSED_DATA_KEY] = "1";
  const ui = await createShadowRootUi(ctx, {
    name: "fl-sales-nav-lead",
    position: "inline",
    append(anchor, ui) {
      anchor.prepend(ui);
    },
    anchor: node.parentElement,
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
};

export const throttledInjectSalesNavLead = throttle(injectSalesNavLead, 250);
