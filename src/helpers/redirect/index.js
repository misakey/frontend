import isSamePage from 'helpers/isSamePage';
import isSameHost from '@misakey/helpers/isSameHost';


export default (href, forceRefresh = false) => {
  if (forceRefresh && isSamePage(href)) {
    window.location.reload();
  }
  if (!isSameHost(href)) {
    window.location.replace(href);
  }
};
