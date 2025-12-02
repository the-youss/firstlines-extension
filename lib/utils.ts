import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



// Debounce function to limit the frequency of updates
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timeoutId: number | undefined;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  } as T;
}



export const createElement = (container: HTMLElement, id: string) => {
  const div = container.querySelector(`body > #${id}`);

  if (!div) {
    const _div = document.createElement('div')
    _div.id = id;
    container.append(_div)
    return _div
  }

  return div;
}


export const urlsToWatch = ["salesApiPeopleSearch", "salesApiLeadSearch"];

// Helper
export function waitFor(selector: string): Promise<Element> {
  return new Promise(resolve => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const obs = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        obs.disconnect();
        resolve(el);
      }
    });

    obs.observe(document.body, { childList: true, subtree: true });
  });
}