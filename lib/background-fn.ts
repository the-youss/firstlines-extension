import { LinkedinCookies } from "@/models/LinkedinCookies"
import { getCookies } from "./cookie"
import { storageFn } from "./storage"
import { StartExtractionProps } from "@/models/StartExtractionProps";
import { api } from "./api";
export const getLinkedinCookies = async (): Promise<LinkedinCookies> => {
  const cookies = await getCookies("https://www.linkedin.com", [
    "li_a",
    "li_at",
    "JSESSIONID",
  ]);
  return cookies as LinkedinCookies;
};
export const exportSearchLeads = async () => {
  const cookies = await getLinkedinCookies()
  const LK__REQUEST_HEADERS = await storageFn.get<{ headers: Array<{ name: string, value: string }> }>('__FL_LK__REQUEST_HEADERS')
  const LK__REQUEST = await storageFn.get<{ url: string }>('__FL_LK__REQUEST')

  const obj: StartExtractionProps = {
    cookies,
    headers: LK__REQUEST_HEADERS.headers,
    url: LK__REQUEST.url,
  };
  if (!obj.cookies || !obj.headers || !obj.url) {
    throw new Error('Something went wrong, please refresh the page and try again')
  }
  try {
    const res = await api.createPayload(obj);
    const identifier =  res.result.data.identifier
    const url = `https://app.firstlines.ai/ext/${identifier}`;
    browser.tabs.create({ url });
  } catch (error:any) {
    console.log(error)
     throw new Error(error.message)
  }
}

