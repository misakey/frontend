import isEmpty from '@misakey/helpers/isEmpty';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';

const replaceHash = (newHash = '', url = window.location.href, replaceEmpty = false) => {
  const { hash } = parseUrlFromLocation(url);

  if (!isEmpty(hash)) {
    return url.replace(hash, newHash);
  }
  if (replaceEmpty) {
    return `${url}${newHash}`;
  }
  return url;
};

export default replaceHash;
