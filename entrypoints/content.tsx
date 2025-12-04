import { injectLinkedinName } from '@/components/linkedin-profile-name';
import { injectLinkedinProfile } from '@/components/linkedin-profile';
import { EVENT_NAME } from '@/lib/event.name';
import { storageFn } from '@/lib/storage';
import { ContentScriptContext } from 'wxt/client';
import { injectLinkedinSearch } from '@/components/linkedin-search';

declare var navigation: any;
export default defineContentScript({
	matches: ['*://*.linkedin.com/*'],
	runAt: 'document_idle',
	cssInjectionMode: 'ui',
	async main(ctx) {
		injectGlobalCss()
		// await injectScript("/--lk--.js", {
		// 	keepInDom: true,
		// });
		main(ctx)
		console.log("________________!");
	},
});

async function main(ctx: ContentScriptContext) {
	window.addEventListener("message", (event) => {
		if (event.source !== window) return; // only accept messages from page
		if (event.data?.type === EVENT_NAME.LINKEDIN_API_REQUEST) {
			const data = event.data;
			storageFn.save('__FL_LK__REQUEST', data);
		}
	})

	// await injectSalesNavSearch(ctx);
	// await injectSyncCookie(ctx);
	// await injectSalesNavLead(ctx)
	injectLinkedinName(ctx);
	injectLinkedinProfile(ctx)
	injectLinkedinSearch(ctx)


	let lastUrl = location.href;
	navigation.addEventListener("navigatesuccess", () => {
		setTimeout(() => {
			if (lastUrl !== location.href) {
				console.log("🔄 URL changed:", lastUrl, location.href);
				lastUrl = location.href;
				// await injectSalesNavSearch(ctx);
				// await injectSyncCookie(ctx);
				// await injectSalesNavLead(ctx)
				injectLinkedinName(ctx)
				injectLinkedinProfile(ctx)
				injectLinkedinSearch(ctx)
			}
		}, 250);
	});

}


function injectGlobalCss() {
	// @ts-expect-error
	const cssUrl = browser.runtime.getURL("assets/global.css");
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = cssUrl;
	document.head.appendChild(link);
}