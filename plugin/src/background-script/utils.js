import isString from '@misakey/helpers/isString';
import isEmpty from '@misakey/helpers/isEmpty';


export async function getCurrentTab() {
  const tabs = await browser.tabs.query({ currentWindow: true, active: true });
  return tabs[0] || {};
}

export async function getTab(tabId) {
  const tab = await browser.tabs.get(tabId);
  return tab || null;
}

export function capitalize(name) {
  if (!isString(name) || isEmpty(name)) { return ''; }
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}
