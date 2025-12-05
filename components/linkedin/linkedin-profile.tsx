import '@/assets/shadcn.css';
import { Message } from '@/lib/message';
import { cn, NODE_PROCESSED_DATA_KEY, NODE_PROFILE_IDENTIFIER_KEY } from '@/lib/utils';
import { throttle } from 'lodash-es';
import ReactDOM from "react-dom/client";
import { ContentScriptContext } from "wxt/client";
import { ListComboBox } from '../list-combo-box';
import { Button, buttonVariants } from '../ui/button';
import { useSingleImportLead } from '@/hooks/use-single-import-lead';
import { ExternalLink } from 'lucide-react';

const LinkedinProfile = ({ container }: { container: HTMLElement }) => {
  const { isLoading, url, _onSelect } = useSingleImportLead(container)

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ className: "rounded-2xl" }))}>
        <ExternalLink />
        Open profile
      </a>
    )
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
      appContainer.dataset[NODE_PROFILE_IDENTIFIER_KEY] = window.location.pathname?.split('/in/')?.pop()?.replace('/', '') || ''
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
