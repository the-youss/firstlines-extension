import '@/assets/shadcn.css';
import { cn, NODE_PROCESSED_DATA_KEY, NODE_PROFILE_IDENTIFIER_KEY } from "@/lib/utils";
import { throttle } from 'lodash-es';
import ReactDOM from "react-dom/client";
import { ContentScriptContext } from "wxt/client";
import { ListComboBox } from '../list-combo-box';
import { Button, buttonVariants } from "../ui/button";
import { ExternalLink } from 'lucide-react';

export const SalesNavLead = ({ container }: { container: HTMLElement }) => {
  const { _onSelect, isLoading, url } = useSingleImportLead(container)

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants())}>
        <ExternalLink />
        Open Profile
      </a>
    )
  }
  return (
    <ListComboBox shadowRoot={container!} onSelect={_onSelect}>
      <span>
        <Button>
          {isLoading ? "Please wait" : "Import lead"}
        </Button>
      </span>
    </ListComboBox>

  )
}

const SELECTOR = '#profile-card-section div[class*=_cta-container_]'

const isSalesNavProfilePage = () =>
  /^\/sales\/lead\//.test(window.location.pathname);
const isSalesNavSearchResultsPage = () =>
  /^\/sales\/search\/people/.test(window.location.pathname);

const tag = 'fl-sales-nav-lead'

export const injectSalesNavLead = async (ctx: ContentScriptContext) => {

  if (!isSalesNavProfilePage() && !isSalesNavSearchResultsPage()) return;
  console.log('[injectSalesNavLead] called')

  const node = document.querySelector(SELECTOR) as HTMLElement;

  if (!node) return;

  if (node.dataset[NODE_PROCESSED_DATA_KEY]) return;
  node.dataset[NODE_PROCESSED_DATA_KEY] = "1";
  const ui = await createShadowRootUi(ctx, {
    name: tag,
    position: "inline",
    append(anchor, ui) {
      anchor.prepend(ui);
    },
    anchor: node.parentElement,
    onMount(container) {
      const appContainer = document.createElement("div");
      appContainer.id = "fl_sales_nav_lead_root";
      appContainer.dataset[NODE_PROFILE_IDENTIFIER_KEY] = (window.location.pathname?.split('/sales/lead/')?.pop()?.replace('/', '') || '').split(',').shift() || ''
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
