import { ContentScriptContext } from "wxt/client";
import { injectSalesNavLead, throttledInjectSalesNavLead } from './sales-nav-lead';
import { injectSalesNavSearch, throttledInjectSalesNavSearch } from './sales-nav-search';
import { injectSalesNavLeadList, throttledInjectSalesNavLeadList } from "./sales-nav-lead-list";

export const injectSalesNavComponents = (ctx: ContentScriptContext) => {
  injectSalesNavLead(ctx);
  injectSalesNavSearch(ctx);
  injectSalesNavLeadList(ctx)

  return () => {
    throttledInjectSalesNavLead(ctx);
    throttledInjectSalesNavSearch(ctx);
    throttledInjectSalesNavLeadList(ctx)
  }
}
