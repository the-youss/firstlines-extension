import '@/assets/shadcn.css';
import ReactDOM from "react-dom/client";
import { ContentScriptContext } from "wxt/client";
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
const LinkedinProfileName = ({ container }: { container: HTMLElement }) => {
  const _onClick = useCallback(() => {
    browser.runtime.sendMessage({
      type: 'export-leads',
    })
  }, [])


  return (
    <ComboBox options={options} shadowRoot={container!}>
      {({ selectedOption }) => (
        <span className='text-primary font-semibold cursor-pointer'>Import lead</span>
      )}
    </ComboBox>

  )
}
const OBSERVER_SELECTOR = ".scaffold-finite-scroll__content";
const SELECTOR = '.update-components-actor__sub-description'
let obs:
  | MutationObserver
  | undefined;
const isLinkedinProfileNamePage = () => /^\/feed/.test(window.location.pathname);

const tag = 'fl-lk-name'

export const injectLinkedinName = async (ctx: ContentScriptContext, node?: HTMLElement) => {


  if (!isLinkedinProfileNamePage()) return;


  const element = node ?? document.querySelector(SELECTOR);
  console.log('elements', element)
  if (element?.querySelector(tag)) {
    return
  }
  const ui = await createShadowRootUi(ctx, {
    position: "inline",
    name: 'fl-lk-name',
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
};

export function injectLinkedinNameObs(ctx: ContentScriptContext) {
  if (!isLinkedinProfileNamePage()) return;

  const el = document.querySelector(OBSERVER_SELECTOR);
  if (!el) return;

  if (obs) obs.disconnect();

  obs = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        // 1️⃣ The new node matches the selector
        if (node.matches?.(SELECTOR)) {
          injectLinkedinName(ctx, node)
        }

        // 2️⃣ Or it contains matching children
        const matches = node.querySelectorAll?.(SELECTOR);
        matches?.forEach((matchEl) => {
          injectLinkedinName(ctx, matchEl as HTMLElement)
        });
      }
    }
  });

  obs.observe(el, {
    childList: true,
    subtree: true,
  });
}
