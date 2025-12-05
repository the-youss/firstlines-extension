import { injectLinkedinProfile, throttledInjectLinkedinProfile } from '@/components/linkedin/linkedin-profile';
import { injectLinkedinName, throttledInjectLinkedinName } from '@/components/linkedin/linkedin-profile-name';
import { injectLinkedinSearch, throttledInjectLinkedinSearch } from '@/components/linkedin/linkedin-search';
import { ContentScriptContext } from 'wxt/client';


export const injectLinkedinComponents = (ctx: ContentScriptContext) => {
  injectLinkedinProfile(ctx);
  injectLinkedinName(ctx);
  injectLinkedinSearch(ctx);

  return () => {
    throttledInjectLinkedinProfile(ctx);
    throttledInjectLinkedinName(ctx);
    throttledInjectLinkedinSearch(ctx);
  }
}
