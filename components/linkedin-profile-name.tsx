import '@/assets/shadcn.css';
import { NODE_PROCESSED_DATA_KEY, waitFor } from '@/lib/utils';
import { throttle } from 'lodash-es';
import ReactDOM from "react-dom/client";
import { ContentScriptContext } from "wxt/client";
import { ListComboBox } from './list-combo-box';

const LinkedinProfileName = ({ container }: { container: HTMLElement }) => {
  const _onSelect = useCallback((listId: string | 'new-list') => {
    let listName: string = ''
    if (listId === 'new-list') {
      listName = window.prompt('Enter list name') || ''
    }
  }, [])


  return (
    <ListComboBox shadowRoot={container!} onSelect={_onSelect}>
      <span className='text-primary font-semibold cursor-pointer'>Import lead</span>
    </ListComboBox>

  )
}
const OBSERVER_SELECTOR = ".scaffold-finite-scroll__content";
const SELECTOR = '.update-components-actor__sub-description'
let obs:
  | MutationObserver
  | undefined;
const isLinkedinProfileNamePage = () => /^\/feed/.test(window.location.pathname);

const tag = 'fl-lk-name'

const _injectLinkedinName = async (ctx: ContentScriptContext, node?: HTMLElement[]) => {
  if (!isLinkedinProfileNamePage()) return;
  console.log('[injectLinkedinName] called')
  await waitFor(SELECTOR, true);
  const elements = node ?? Array.from(document.querySelectorAll(SELECTOR));
  console.log('elements', elements)
  for (const element of elements) {
    if (!element) return;

    // 🔥 Prevent duplicate injection
    if (element.dataset.lkInjected === "true") {
      return;
    }
    const ui = await createShadowRootUi(ctx, {
      position: "inline",
      name: tag,
      anchor: element,
      onMount(container) {
        const appContainer = document.createElement("span");
        appContainer.id = "fl_lk_name_root";
        container.appendChild(appContainer);

        const root = ReactDOM.createRoot(appContainer);
        root.render(<LinkedinProfileName container={appContainer} />);
        return root;
      },
      onRemove(root) {
        root?.unmount();
      },
    });

    ui.mount();

    element.dataset.lkInjected = "true";
  }

};

function injectLinkedinNameObs(ctx: ContentScriptContext) {
  if (!isLinkedinProfileNamePage()) return;


  const el = document.querySelector(OBSERVER_SELECTOR);
  if (!el) return;

  if (obs) obs.disconnect();

  obs = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.matches?.(SELECTOR)) {
          _injectLinkedinName(ctx, [node])
        }
      }
    }
  });

  obs.observe(el, {
    childList: true,
    subtree: true,
  });
}


export async function injectLinkedinName(ctx: ContentScriptContext) {
  // await _injectLinkedinName(ctx)
  // injectLinkedinNameObs(ctx)
  if (!isLinkedinProfileNamePage()) return;
  console.log('[injectLinkedinName] called')
  const nodes = Array.from<HTMLElement>(
    document.querySelectorAll(SELECTOR)
  );

  nodes.forEach(async (node) => {
    if (node.dataset[NODE_PROCESSED_DATA_KEY]) return;
    node.dataset[NODE_PROCESSED_DATA_KEY] = "1";

    const ui = await createShadowRootUi(ctx, {
      position: "inline",
      name: tag,
      anchor: node,
      onMount(container) {
        const appContainer = document.createElement("span");
        appContainer.id = "fl_lk_name_root";
        container.appendChild(appContainer);

        const root = ReactDOM.createRoot(appContainer);
        root.render(<LinkedinProfileName container={appContainer} />);
        return root;
      },
      onRemove(root) {
        root?.unmount();
      },
    });

    ui.mount();

  })
}

export const throttledInjectLinkedinName = throttle(injectLinkedinName, 250);
