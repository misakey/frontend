/* global browser */ // eslint-disable-line no-redeclare

export function redirectToApp(path) {
  browser.tabs.create({
    url: `${window.env.APP_URL}${path}`,
  });
}


export function openInNewTab(url) {
  browser.tabs.create({ url });
}
