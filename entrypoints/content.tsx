
import { injectLinkedinComponents } from '@/components/linkedin';
import { injectSalesNavComponents } from '@/components/sales-nav';
import { EVENT_NAME } from '@/lib/event.name';
import { Message } from '@/lib/message';
import { storageFn } from '@/lib/storage';
import { preloadStorage } from '@/lib/use-store';
import { ContentScriptContext } from 'wxt/client';

declare var navigation: any;
export default defineContentScript({
	matches: ['*://*.linkedin.com/*'],
	runAt: 'document_idle',
	cssInjectionMode: 'ui',
	async main(ctx) {
		injectGlobalCss()
		await injectScript("/--lk--.js", {
			keepInDom: true,
		});
		main(ctx)
		console.log("________________!");
	},
});
const setupInjections = (ctx: ContentScriptContext) => {
	const throttledInjectLinkedinComponents = injectLinkedinComponents(ctx);
	const throttledInjectSalesNavComponents = injectSalesNavComponents(ctx);

	const observer = new MutationObserver(() => {
		throttledInjectLinkedinComponents()
		throttledInjectSalesNavComponents()
	});

	observer.observe(document, {
		attributes: true,
		childList: true,
		subtree: true,
	});
};
async function main(ctx: ContentScriptContext) {
	window.addEventListener("message", (event) => {
		if (event.source !== window) return; // only accept messages from page
		if (event.data?.type === EVENT_NAME.LINKEDIN_API_REQUEST) {
			const data = event.data;
			storageFn.save('__FL_LK__REQUEST', data);
		}
	})
	await browser.runtime.sendMessage({ type: Message.preloadStorage });
	setupInjections(ctx)
	// await injectSalesNavSearch(ctx);
	// await injectSyncCookie(ctx);
	// await injectSalesNavLead(ctx)
	// injectLinkedinName(ctx);
	// injectLinkedinProfile(ctx)
	// injectLinkedinSearch(ctx)
}


function injectGlobalCss() {
	// @ts-expect-error
	const cssUrl = browser.runtime.getURL("assets/global.css");
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = cssUrl;
	document.head.appendChild(link);
}