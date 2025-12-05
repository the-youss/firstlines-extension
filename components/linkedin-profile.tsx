import '@/assets/shadcn.css';
import { cn, NODE_PROCESSED_DATA_KEY, waitFor } from '@/lib/utils';
import ReactDOM from "react-dom/client";
import { ContentScriptContext } from "wxt/client";
import { Button, buttonVariants } from './ui/button';
import { ListComboBox } from './list-combo-box';
import { throttle } from 'lodash-es';
import { Message } from '@/lib/message';

const LinkedinProfile = ({ container }: { container: HTMLElement }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState('');
  const _onSelect = useCallback(async (listId: string | 'new-list') => {
    let listName: string = ''
    if (listId === 'new-list') {
      listName = window.prompt('Enter list name') || ''
      if (!listName) return
    }

    if (!listId && !listName) return
    const profileIdentifer = container.dataset.profileIdentifier || ''
    if (!profileIdentifer) return
    setIsLoading(true);
    try {
      const response: any = await browser.runtime.sendMessage({
        type: Message.importSingleProfile,
        input: {
          listId,
          listName,
          source: 'linkedin_search',
          identifier: profileIdentifer,
        }
      })
      setUrl(response.url);
    } catch (error) {
      setUrl('')
    } finally {
      setIsLoading(false);
    }
  }, [container])

  if (url) {
    return <a href={url} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ className: "rounded-2xl" }))}>Open profile</a>
  }
  return (
    <ListComboBox shadowRoot={container!} onSelect={_onSelect}>
      <span>
        <Button className='rounded-2xl' disabled={isLoading}>{isLoading ? 'Please wait...' : 'Import lead'}</Button>
      </span>
    </ListComboBox>

  )
}
const SELECTOR = '[id^="ember"][id*="-profile-overflow-action"]'

const isLinkedinProfilePage = () =>
  /^\/in\/[A-Za-z0-9\-]+\/?$/.test(window.location.pathname);

const tag = 'fl-lk-profile'

export const _injectLinkedinProfile = async (ctx: ContentScriptContext) => {
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



export const injectLinkedinProfile = async (ctx: ContentScriptContext) => {
  if (!isLinkedinProfilePage()) return;

  console.log('[injectLinkedinProfile] called')
  const elements = document.querySelectorAll(SELECTOR);
  const node = (elements.length > 0 ? elements[1] : null)?.parentElement?.parentElement as HTMLElement;

  if (!node) return;

  if (node.dataset[NODE_PROCESSED_DATA_KEY]) return;
  node.dataset[NODE_PROCESSED_DATA_KEY] = "1";
  const ui = await createShadowRootUi(ctx, {
    position: "inline",
    name: tag,
    anchor: node,
    onMount(container) {
      const appContainer = document.createElement("span");
      appContainer.id = "fl_lk_profile_root";
      appContainer.dataset.profileIdentifier = window.location.pathname?.split('/in/')?.pop()?.replace('/', '') || ''
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
};

export const throttledInjectLinkedinProfile = throttle(injectLinkedinProfile, 250);
