import { STORAGE_KEYS } from "./storage.keys";

type Keys = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
export const storageFn = {
  save: async (key: Keys, value: any) => {
    await browser.storage.local.set({ [key]: value });
  },

  get: async <T = unknown>(key: Keys) => {
    const result = await browser.storage.local.get(key);
    return result[key] as T;
  }
}