function parseUrlFromLocation(url = '/') {
  return new URL(url, window.location.href);
}

export default parseUrlFromLocation;
