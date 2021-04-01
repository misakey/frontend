import isSamePage from '@misakey/core/helpers/isSamePage';
import isSameHost from '@misakey/core/helpers/isSameHost';


export default (href, forceRefresh = false) => {
  if (forceRefresh && isSamePage(href)) {
    window.location.reload();
  }
  if (!isSameHost(href)) {
    window.location.replace(href);
  }
};
