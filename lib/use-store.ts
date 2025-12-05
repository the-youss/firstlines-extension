import { create } from 'zustand';
import { combine, createJSONStorage, persist } from 'zustand/middleware';
import { api } from './api';
import { STORAGE_KEYS } from './storage.keys';
import { Message } from './message';

let preloadStore: Record<string, any> = {};

export async function preloadStorage() {
  preloadStore = await browser.storage.local.get();
}

function createBrowserStorage() {
  return {
    getItem(name: string) {
      return preloadStore[name] ?? null;
    },
    setItem(name: string, value: string) {
      preloadStore[name] = value;
      browser.storage.local.set({ [name]: value });
    },
    removeItem(name: string) {
      delete preloadStore[name];
      browser.storage.local.remove(name);
    },
  };
}
const cacheTime = 30 * 60 * 1000; // 30 minutes in milliseconds
export const useStore = create(
  persist(
    combine(
      {
        lists: {
          fetchAt: null as unknown as number,
          isLoading: false,
          data: [] as Array<{ id: string, name: string }>,
        },
      },
      (set, get) => ({
        refetchLists: async () => {
          const now = Date.now();
          const state = get()

          if (state.lists.fetchAt && now - state.lists.fetchAt < cacheTime) {
            return state.lists.data
          }
          set({ ...state, lists: { ...state.lists, isLoading: true } })
          const lists = await browser.runtime.sendMessage({ type: Message.fetchLists }) as { result: { data: Array<{ id: string, name: string }> } }
          set({ ...state, lists: { ...state.lists, fetchAt: now, isLoading: false, data: lists.result.data } })
          return lists

        },
      })
    ),
    {
      name: STORAGE_KEYS.__FL_STORE,
      storage: createJSONStorage(() => createBrowserStorage()),
    }
  )
);
