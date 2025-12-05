import { Message } from "@/lib/message";
import { NODE_PROFILE_IDENTIFIER_KEY } from "@/lib/utils";

export const useSingleImportLead = (container: HTMLElement) => {
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState('');
  const _onSelect = useCallback(async (listId: string | 'new-list') => {
    let listName: string = ''
    if (listId === 'new-list') {
      listName = window.prompt('Enter list name') || ''
      if (!listName) return
    }

    if (!listId && !listName) return
    const profileIdentifer = container.dataset[NODE_PROFILE_IDENTIFIER_KEY] || ''
    if (!profileIdentifer) return
    setIsLoading(true);
    try {
      const response: any = await browser.runtime.sendMessage({
        type: Message.importSingleProfile,
        input: {
          listId: listId === 'new-list' ? '' : listId,
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

  return {
    isLoading,
    url,
    _onSelect,
  }
}
