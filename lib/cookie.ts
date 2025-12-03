import { LinkedinCookies } from "../models/LinkedinCookies";

export async function getCookies<
  T extends { [key: string]: string | undefined }
>(origin: string, names: string[]): Promise<T> {
  const cookies: { [key: string]: string | undefined } = {};
  if (!browser.cookies) {
    throw Error("chrome.cookies must be called in background");
  }
  const array = await Promise.all(
    names.map((name) => browser.cookies.get({ name: name, url: origin }))
  );
  for (const cookie of array) {
    if (cookie && names.includes(cookie.name)) {
      cookies[cookie.name] = cookie.value;
    }
  }
  return cookies as T;
}

export const getCookie = (origin: string, name: string) =>
  getCookies(origin, [name]).then((cookies) => cookies[name]);

