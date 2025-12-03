import { LinkedinCookies } from "./LinkedinCookies";

export interface StartExtractionProps {
  cookies: LinkedinCookies,
  url: string,
  headers: Array<{
    name: string,
    value: string,
  }>
}