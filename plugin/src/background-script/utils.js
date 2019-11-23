import isString from '@misakey/helpers/isString';
import isEmpty from '@misakey/helpers/isEmpty';
import assignInWith from '@misakey/helpers/assignInWith';
import keyBy from '@misakey/helpers/keyBy';
import log from '@misakey/helpers/log';
import common from '@misakey/ui/colors/common';

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

export function setBadgeBackgroundColor(color) {
  try {
    browser.browserAction.setBadgeBackgroundColor({ color });
  } catch (error) {
    log('Operation not supported by device');
  }
}

export function setBadgeTextColor(color) {
  try {
    browser.browserAction.setBadgeTextColor({ color });
  } catch (error) {
    log('Operation not supported by device');
  }
}

export function setBadgeText(text) {
  try {
    browser.browserAction.setBadgeText({ text });
  } catch (error) {
    log('Operation not supported by device');
  }
}

export function setIcon(path) {
  try {
    browser.browserAction.setIcon({ path });
  } catch (error) {
    log('Operation not supported by device');
  }
}

export function toggleBadgeAndIconOnPaused(paused = false) {
  const color = paused ? common.primary : common.misakey;
  const path = paused ? 'ico/favicon-32x32-grey.png' : 'ico/favicon-32x32.png';

  setBadgeBackgroundColor(color);
  setIcon(path);
}

// @FIXME add to js-common helpers
export function mergeArrays(array1, array2, key) {
  const arrayAsObject = keyBy(array1, key);
  array2.forEach((element) => {
    arrayAsObject[element[key]] = assignInWith(
      element,
      arrayAsObject[element[key]],
      (objValue, srcValue) => (isEmpty(objValue) ? srcValue : objValue),
    );
  });
  return Object.values(arrayAsObject);
}


export function filterAppsBy(search, mainPurpose, apps) {
  let filteredApps = [...apps];
  if (isString(search) && !isEmpty(search)) {
    filteredApps = filteredApps
      .filter((app) => (app.mainDomain.toLowerCase().includes(search.toLowerCase())));
  }

  if (mainPurpose) {
    filteredApps = filteredApps.filter((app) => (app.mainPurpose === mainPurpose));
  }

  return filteredApps;
}


export function markAsFetched(apps, domainFetched) {
  return apps.map((app) => {
    if (domainFetched.includes(app.mainDomain)) {
      return { ...app, fetched: true };
    }
    return app;
  });
}
