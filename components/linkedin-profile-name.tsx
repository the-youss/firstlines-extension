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

export const injectLinkedinName = async (ctx: ContentScriptContext) => {


  if (!isLinkedinProfileNamePage()) return;


  const elements = document.querySelectorAll(SELECTOR);
  console.log('elements', elements)
  for (const element of elements) {
    // double-check before inserting
    if (element.querySelector(tag)) {
      continue
    } else {
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
    }
  }
};

export function injectLinkedinNameObs(ctx: ContentScriptContext) {
  // handle search results mutation reinjection
  if (isLinkedinProfileNamePage()) {
    const el = document.querySelector(
      OBSERVER_SELECTOR
    );

    if (el) {
      if (obs)
        obs.disconnect();

      obs = new MutationObserver(() => {
        console.log('detected')
        // We only re-inject if UI is gone
        setTimeout(() => injectLinkedinName(ctx), 500)
      });

      obs.observe(
        el,
        { childList: true, }
      );
    }
  }
}