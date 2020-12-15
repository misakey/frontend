
import map from '@misakey/helpers/map';
import replaceHash from '@misakey/helpers/replaceHash';

// Replaced by '<hash_hidden>' to help debugging and differenciate
// cases where hash is missing on url from hash is hidden to Sentry for security
const sentryReplaceHash = (url) => replaceHash('<hash_hidden>', url);

/*
* Do no send hash part of browser url to Sentry
* For now nothing sensible is send in events `xhr` and `fetch`
* but we could safe them too later if needed
*/
export default (event) => {
  const { breadcrumbs, request } = event;
  const safeBreadcrumbs = map(breadcrumbs, ({ category, data, ...rest }) => {
    if (category === 'navigation') {
      const { from, to, ...restData } = data;
      return {
        category,
        data: { ...restData, from: sentryReplaceHash(from), to: sentryReplaceHash(to) },
        ...rest,
      };
    }
    return { category, data, ...rest };
  });
  const safeUrl = sentryReplaceHash(request.url);
  return { ...event, breadcrumbs: safeBreadcrumbs, request: { ...request, url: safeUrl } };
};
