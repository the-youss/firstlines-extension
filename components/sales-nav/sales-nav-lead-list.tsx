import '@/assets/shadcn.css';
import { Message } from '@/lib/message';
import { NODE_PROCESSED_DATA_KEY, waitFor } from "@/lib/utils";
import ReactDOM from "react-dom/client";
import { Fragment } from 'react/jsx-runtime';
import { ContentScriptContext } from "wxt/client";
import { Button } from "../ui/button";
import { throttle } from 'lodash-es';

export const SalesNavLeadList = () => {
  const [isLoading, setIsLoading] = useState(false)
  const _onClick = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await browser.runtime.sendMessage({
        type: Message.exportSearchLeads,
        input: {
          sourceURL: window.location.href
        }
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

const SELECTOR = '.lists-nav > div:nth-last-child(1) div div'

const isSalesNavLeadListPage = () =>
  /^\/sales\/lists\/people\/\d+/.test(window.location.pathname);


export const injectSalesNavLeadList = async (ctx: ContentScriptContext) => {
  if (!isSalesNavLeadListPage()) return;
  console.log('[injectSalesNavLeadList] called')

  const node = document.querySelector(SELECTOR) as HTMLElement;

  if (!node) return;

  if (node.dataset[NODE_PROCESSED_DATA_KEY]) return;
  node.dataset[NODE_PROCESSED_DATA_KEY] = "1";

  const ui = await createShadowRootUi(ctx, {
    name: "fl-sales-nav-lead-list",
    position: 'inline',
    anchor: node,
    append(anchor, ui) {
      anchor.append(ui)
    },
    onMount(container) {
      const appContainer = document.createElement("div");
      appContainer.id = "fl_sales_nav_lead_list_root";
      container.appendChild(appContainer);

      const root = ReactDOM.createRoot(appContainer);
      root.render(
        <SalesNavLeadList />
      );
      return root;
    },
    onRemove(root) {
      root?.unmount();
    }
  })
  ui.mount();
}


export const throttledInjectSalesNavLeadList = throttle(injectSalesNavLeadList, 250);
