import { ContentScriptContext } from "wxt/client";
import { injectSalesNavLead, throttledInjectSalesNavLead } from './sales-nav-lead';
import { injectSalesNavSearch, throttledInjectSalesNavSearch } from './sales-nav-search';

export const injectSalesNavComponents = (ctx: ContentScriptContext) => {
  injectSalesNavLead(ctx);
  injectSalesNavSearch(ctx);

  return () => {
    throttledInjectSalesNavLead(ctx);
    throttledInjectSalesNavSearch(ctx);
  }
}
