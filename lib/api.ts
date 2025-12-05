import { StartExtractionProps } from "@/models/StartExtractionProps";
import ky, { ResponsePromise, isHTTPError } from 'ky';
import { APP_URL } from "./config";
import { getCookie, getCookies } from "./cookie";


const APP_SESSION_COOKIE_NAME = "better-auth.session_token";
const APP_SESSION_COOKIE_NAME_SECURE = "__Secure-better-auth.session_token";

export const getAppSessionTokenValue = async () => {
  return (
    (await getCookie(APP_URL, APP_SESSION_COOKIE_NAME)) ||
    (await getCookie(APP_URL, APP_SESSION_COOKIE_NAME_SECURE))
  );
};

export const getAppSessionTokenName = () => APP_SESSION_COOKIE_NAME;

type Result<T> = {
  "result": {
    "data": T
  }
}

const _fetch = ky.create({
  prefixUrl: `${APP_URL}/api/trpc`,
  fetch: async (url, options) => {
    const headers = new Headers(options?.headers)
    headers.set('content-type', 'application/json')
    return fetch(url, { ...options, headers });
  }
})



async function catchError<T = unknown>(fn: () => ResponsePromise<Result<T>>) {
  try {
    const res = await fn();
    return res.json();
  } catch (error) {
    if (isHTTPError(error)) {
      const json = await error.response.json() as { error?: { message: string } };
      throw new Error(json.error?.message ?? 'Something went wrong');
    }
    throw error;
  }
}

export const api = {
  createPayload: async (obj: StartExtractionProps) => {
    const res = await catchError<{
      "identifier": string
    }>(() => _fetch('extension.createPayload', {
      method: 'POST',
      json: { payload: obj },
    }))
    return res
  },
  syncLinkedinSession: async (obj: Pick<StartExtractionProps, 'cookies' | 'headers'>) => {
    await catchError<null>(() => _fetch('extension.syncLinkedinSession', {
      method: 'POST',
      json: obj,
    }))
  },
  getLists: async () => {
    return catchError<Array<{ id: string, name: string }>>(() => _fetch('extension.getLists', {
      method: 'GET',
    }))
  },

  importSingleProfile: async (obj: { listId?: string, listName?: string, source: 'sales_nav' | 'linkedin_search', identifier: string }) => {
    return catchError<{ listId: string }>(() => _fetch('extension.importSingleProfile', {
      method: 'POST',
      json: obj,
    }))
  }
}

