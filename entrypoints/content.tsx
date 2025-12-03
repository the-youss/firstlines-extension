import { injectSalesNavLead } from '@/components/sales-nav-lead';
import { injectSalesNavSearch } from '@/components/sales-nav-search';
import { injectSyncCookie } from '@/components/sync-cookie';
import { EVENT_NAME } from '@/lib/event.name';
import { storageFn } from '@/lib/storage';
import { ContentScriptContext } from 'wxt/client';


export default defineContentScript({
	matches: ['*://*.linkedin.com/*'],
	cssInjectionMode: 'ui',
	async main(ctx) {
		await injectScript("/--lk--.js", {
			keepInDom: true,
		});
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

	await injectSalesNavSearch(ctx);
	await injectSyncCookie(ctx);
	// await injectSalesNavLead(ctx)


	let lastUrl = location.href;

	const observer = new MutationObserver(() => {
		if (location.href !== lastUrl) {
			lastUrl = location.href;
			setTimeout(async () => {
				console.log("🔄 URL changed:", lastUrl);
				await injectSalesNavSearch(ctx);
				await injectSyncCookie(ctx);
				// await injectSalesNavLead(ctx)
			}, 250);
		}
	});

	observer.observe(document, { subtree: true, childList: true });
}


