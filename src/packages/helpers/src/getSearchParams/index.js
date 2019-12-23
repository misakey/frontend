import parseUrlFromLocation from '../parseUrl/fromLocation';
import urlSearchParamsToObject from '../urlSearchParamsToObject';

function getSearchParams(url = '') {
  return urlSearchParamsToObject(parseUrlFromLocation(url).searchParams);
}

export default getSearchParams;
