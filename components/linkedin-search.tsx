import '@/assets/shadcn.css';
import { NODE_PROCESSED_DATA_KEY, waitFor } from '@/lib/utils';
import ReactDOM from "react-dom/client";
import { ContentScriptContext } from "wxt/client";
import { Button } from './ui/button';
import { throttle } from 'lodash-es';

const LinkedinSearch = () => {
  const _onClick = useCallback(() => {
    browser.runtime.sendMessage({
      type: 'export-leads',
    })
  }, [])


  return (
    <Button className='w-full mb-2' size='lg'>Import leads</Button>

  )
}
const SELECTORS = ['.scaffold-layout__aside .scaffold-layout__sticky', '[componentKey="SearchResults_SearchRightRail"] > div > div']

const isLinkedinSearchPage = () =>
  /^\/search\/results\/[a-z]+\/?$/.test(window.location.pathname);
const tag = 'fl-lk-search'

export const _injectLinkedinSearch = async (ctx: ContentScriptContext) => {
  if (!isLinkedinSearchPage()) return;
  console.log('[injectLinkedinSearch] called')
  const isPeopleSearchPage = window.location.pathname.includes('people')
  const SELECTOR = SELECTORS[isPeopleSearchPage ? 1 : 0]
  await waitFor(SELECTOR);
  const element = document.querySelector(SELECTOR) as HTMLElement;

  if (!element) return;

  // 🔥 Prevent duplicate injection
  if (element.dataset.lkInjected === "true") {
    return;
  }
  const ui = await createShadowRootUi(ctx, {
    position: "inline",
    name: tag,
    anchor: element,
    append(anchor, ui) {
      anchor.prepend(ui);
    },
    onMount(container) {
      const appContainer = document.createElement("span");
      appContainer.id = "fl_lk_search_root";
      container.appendChild(appContainer);

      const root = ReactDOM.createRoot(appContainer);
      root.render(<LinkedinSearch />);
      return root;
    },
    onRemove(root) {
      root?.unmount();
    },
  });

  ui.mount();

  element.dataset.lkInjected = "true";

};



export const injectLinkedinSearch = async (ctx: ContentScriptContext) => {

  if (!isLinkedinSearchPage()) return;

  console.log('[injectLinkedinSearch] called')
  const isPeopleSearchPage = window.location.pathname.includes('people')
  const SELECTOR = SELECTORS[isPeopleSearchPage ? 1 : 0]
  const node = document.querySelector(SELECTOR) as HTMLElement;

  if (!node) return;

  if (node.dataset[NODE_PROCESSED_DATA_KEY]) return;
  node.dataset[NODE_PROCESSED_DATA_KEY] = "1";

  const ui = await createShadowRootUi(ctx, {
    position: "inline",
    name: tag,
    anchor: node,
    append(anchor, ui) {
      anchor.prepend(ui);
    },
    onMount(container) {
      const appContainer = document.createElement("span");
      appContainer.id = "fl_lk_search_root";
      container.appendChild(appContainer);

      const root = ReactDOM.createRoot(appContainer);
      root.render(<LinkedinSearch />);
      return root;
    },
    onRemove(root) {
      root?.unmount();
    },
  });

  ui.mount();
};


export const throttledInjectLinkedinSearch = throttle(injectLinkedinSearch, 250);
