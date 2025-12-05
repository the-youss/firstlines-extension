import '@/assets/shadcn.css';
import { NODE_PROCESSED_DATA_KEY, NODE_PROFILE_IDENTIFIER_KEY, waitFor } from '@/lib/utils';
import { throttle } from 'lodash-es';
import ReactDOM from "react-dom/client";
import { ContentScriptContext } from "wxt/client";
import { ListComboBox } from '../list-combo-box';
import { useSingleImportLead } from '@/hooks/use-single-import-lead';
import { ExternalLink } from 'lucide-react';

const LinkedinProfileName = ({ container }: { container: HTMLElement }) => {
  const { isLoading, url, _onSelect } = useSingleImportLead(container)
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={'text-primary inline-flex items-center font-semibold cursor-pointer'}>
      <ExternalLink className='h-3'/>  Open profile
      </a>
    )
  }
  return (
    <ListComboBox shadowRoot={container!} onSelect={_onSelect}>
      <span className='text-primary font-semibold cursor-pointer'>{isLoading ? "Please wait..." : "Import lead"}</span>
    </ListComboBox>

  )
}
const SELECTOR = '.update-components-actor__sub-description'
const isLinkedinProfileNamePage = () => /^\/feed/.test(window.location.pathname);
const tag = 'fl-lk-name'

export async function injectLinkedinName(ctx: ContentScriptContext) {
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
        let profileId = ''
        try {
          const profileUrl = (node.parentElement?.querySelector('.update-components-actor__meta-link') as HTMLAnchorElement)?.href || ''
          const url = new URL(profileUrl)
          profileId = url.pathname.split('/')[2]
        } catch (error) {

        }
        const appContainer = document.createElement("span");
        appContainer.id = "fl_lk_name_root";
        appContainer.dataset[NODE_PROFILE_IDENTIFIER_KEY] = profileId
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
