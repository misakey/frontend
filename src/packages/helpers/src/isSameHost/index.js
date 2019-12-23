import parseUrlFromLocation from '../parseUrl/fromLocation';

/**
 * Parse a href then compare it to another one (default is current location)
 * Warning: http://example.com is a href, not example.com
 * The last one will fallback on the current base location
 * @param href
 * @param [comparison]
 * @returns {boolean}
 */
function isSameHost(href, comparison) {
  return parseUrlFromLocation(href).host === parseUrlFromLocation(comparison).host;
}

export default isSameHost;
