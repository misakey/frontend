function parseUrlFromLocation(url = '/', href = window.location.href) {
  return new URL(url, href);
}

export default parseUrlFromLocation;
