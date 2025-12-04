import '@/assets/shadcn.css';
import { waitFor } from '@/lib/utils';
import ReactDOM from "react-dom/client";
import { ContentScriptContext } from "wxt/client";
import { Button } from './ui/button';
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
const LinkedinProfile = ({ container }: { container: HTMLElement }) => {
  const _onClick = useCallback(() => {
    browser.runtime.sendMessage({
      type: 'export-leads',
    })
  }, [])


  return (
    <ComboBox options={options} shadowRoot={container!}>
      {({ selectedOption }) => (
        <span>
          <Button className='rounded-2xl'>Import lead</Button>
        </span>
      )}
    </ComboBox>

  )
}
const SELECTOR = '[id^="ember"][id*="-profile-overflow-action"]'

const isLinkedinProfilePage = () =>
  /^\/in\/[A-Za-z0-9\-]+\/?$/.test(window.location.pathname);

const tag = 'fl-lk-profile'

export const injectLinkedinProfile = async (ctx: ContentScriptContext) => {
  if (!isLinkedinProfilePage()) return;
  console.log('[injectLinkedinProfile] called')
  await waitFor(SELECTOR);
  const elements = document.querySelectorAll(SELECTOR);
  const element = (elements.length > 0 ? elements[1] : null)?.parentElement?.parentElement as HTMLElement;

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
      appContainer.id = "fl_lk_profile_root";
      container.appendChild(appContainer);

      const root = ReactDOM.createRoot(appContainer);
      root.render(<LinkedinProfile container={appContainer} />);
      return root;
    },
    onRemove(root) {
      root?.unmount();
    },
  });

  ui.mount();

  element.dataset.lkInjected = "true";


};


