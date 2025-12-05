import { LinkedinCookies } from "@/models/LinkedinCookies"
import { getCookies } from "./cookie"
import { storageFn } from "./storage"
import { StartExtractionProps } from "@/models/StartExtractionProps";
import { api } from "./api";
import { APP_URL } from "./config";
export const getLinkedinCookies = async (): Promise<LinkedinCookies> => {
  const cookies = await getCookies("https://www.linkedin.com", [
    "li_a",
    "li_at",
    "JSESSIONID",
  ]);
  return cookies as LinkedinCookies;
};
export const exportSearchLeads = async (input: Record<string, string>) => {
  const cookies = await getLinkedinCookies()
  const LK__REQUEST_HEADERS = await storageFn.get<{ headers: Array<{ name: string, value: string }> }>('__FL_LK__REQUEST_HEADERS')
  const LK__REQUEST = await storageFn.get<{ url: string }>('__FL_LK__REQUEST')

  const obj: StartExtractionProps = {
    cookies,
    headers: LK__REQUEST_HEADERS.headers,
    url: LK__REQUEST.url,
    sourceURL: input.sourceURL,
  };
  if (!obj.cookies || !obj.headers || !obj.url) {
    throw new Error('Something went wrong, please refresh the page and try again')
  }
  try {
    const res = await api.createPayload(obj);
    const identifier = res.result.data.identifier
    const url = `${APP_URL}/app/ext/${identifier}`;
    browser.tabs.create({ url });
  } catch (error: any) {
    console.log(error)
    throw new Error(error.message)
  }
}

export const syncLinkedinSession = async () => {
  const cookies = await getLinkedinCookies()
  const LK__REQUEST_HEADERS = await storageFn.get<{ headers: Array<{ name: string, value: string }> }>('__FL_LK__REQUEST_HEADERS')

  const obj: Pick<StartExtractionProps, 'cookies' | 'headers'> = {
    cookies,
    headers: LK__REQUEST_HEADERS.headers,
  };
  if (!obj.cookies || !obj.headers) {
    throw new Error('Something went wrong, please refresh the page and try again')
  }
  try {
    console.log('[syncLinkedinSession]', obj)
    await api.syncLinkedinSession(obj);
  } catch (error: any) {
    throw new Error(error.message)
  }
}


export const importSingleProfile = async (obj: { listId?: string, listName?: string, source: 'sales_nav' | 'linkedin_search', identifier: string }) => {
  try {
    const res = await api.importSingleProfile(obj);
    const listId = res.result.data.listId
    const url = `${APP_URL}/app/leads?listId=${listId}`;
    return { url }
  } catch (error: any) {
    throw new Error(error.message)
  }
}