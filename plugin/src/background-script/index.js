/*!
 * Copyright (c) 2017-2019 Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import log from '@misakey/helpers/log';
import common from '@misakey/ui/colors/common';

import { parse } from 'tldts';

import { getBlockingResponse, deserializeEngine } from './engine';
import { getItem } from './storage';
import { getCurrentTab } from './utils';
import globals from './globals';
import { ENGINE_URL, DATABASE_URL } from './config';


/**
 * Initialize the adblocker using lists of filters and resources. It returns a
 * Promise resolving on the `Engine` that we will use to decide what requests
 * should be blocked or altered.
 */
async function loadAdblocker() {
  log('Fetch engine...');
  const engineAsBytes = await (await fetch(ENGINE_URL)).arrayBuffer();
  const { rules } = await (await fetch(DATABASE_URL)).json();

  globals.rules = rules;

  const engine = deserializeEngine(engineAsBytes);
  return Promise.resolve(engine);
}

function handleConfig() {
  try {
    browser.browserAction.setBadgeBackgroundColor({ color: common.misakey });

    if (globals.BROWSER_INFOS.name === 'firefox' && globals.BROWSER_INFOS.version >= 63) {
      browser.browserAction.setBadgeTextColor({ color: common.white });
    }
  } catch (err) { log('Operation non supported by device'); }
}

function handleTabs() {
  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.url) {
      globals.tabsInitiator.set(tabId, changeInfo.url);
    }
  });

  browser.tabs.onActivated.addListener(({ tabId }) => {
    if (tabId > -1) {
      // Popup extension has a tab = -1 : we don't want
      // to update counter if it's the 'newTab' is the popup
      browser.browserAction.setBadgeText({
        text: `${globals.counter.get(tabId) || 0}`,
      });
    }
  });

  browser.tabs.onRemoved.addListener(({ tabId }) => {
    globals.removeTabsInfos(tabId);
  });
}

function handleRequest(engine) {
  const URLS_PATTERNS = ['<all_urls>'];

  browser.webRequest.onHeadersReceived.addListener((details) => (engine.onHeadersReceived(details)),
    { urls: URLS_PATTERNS, types: ['main_frame'] },
    ['blocking', 'responseHeaders']);

  // Start listening to requests, and allow 'blocking' so that we can cancel
  // some of them (or redirect).
  browser.webRequest.onBeforeRequest.addListener((details) => {
    const { blockingResponse, rule } = getBlockingResponse(engine, details);
    const hasToBeBlocked = Boolean(blockingResponse.cancel || blockingResponse.redirectUrl);

    globals.updateBlockingInfos(details, rule, hasToBeBlocked);

    return blockingResponse;
  },
  {
    urls: URLS_PATTERNS,
  },
  ['blocking']);

  // If the popup is opened, send it the new detected urls
  // if it was blocked on its tab as it could display it
  browser.webRequest.onErrorOccurred.addListener(async (details) => {
    if (!globals.popupOpened) {
      return;
    }

    const tab = await getCurrentTab();
    if (tab && details.tabId === tab.id) {
      // postMessage doesn't wait for a response
      globals.popupOpened.postMessage({
        action: 'refreshBlockedInfos',
        detectedTrackers: globals.getTabInfosForPopup(tab.id),
      });
    }
  }, { urls: URLS_PATTERNS });
}

function handleCommunication(engine) {
  // Follow a connection with the popup when it's opened in order to refresh information in popup
  // (cf. browser.webRequest.onErrorOccurred)
  browser.runtime.onConnect.addListener((externalPort) => {
    if (externalPort.name === 'popup') {
      externalPort.onDisconnect.addListener(() => {
        globals.popupOpened = null;
      });

      globals.popupOpened = externalPort;
    }
  });

  // Listener for other scripts messages. The main messages come from popup script
  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch (msg.action) {
      case 'getCurrentDomain':
        return getCurrentTab().then((tab) => {
          const { domain } = parse(tab.url);
          return domain;
        });

      case 'getBlockerState': {
        const { pausedBlocking, pausedTime } = globals;
        return Promise.resolve({
          paused: pausedBlocking,
          pausedTime,
        });
      }
      case 'getCurrentTabResume':
        return Promise.all([getCurrentTab(), getItem('whitelist')]).then(([tab, { whitelist }]) => ({
          detectedTrackers: globals.getTabInfosForPopup(tab.id),
          whitelist,
        }));

      case 'getApps':
        return globals.getThirdPartyApps(msg.search, msg.mainPurpose, msg.getAllThirdParties)
          .then((apps) => ({ apps }));

      case 'togglePauseBlocker':
        return Promise.resolve(globals.onPauseBlocker(msg.time));

      case 'updateWhitelist': {
        const success = globals.updateWhitelist(msg.whitelist);
        return success ? getItem('whitelist') : Promise.reject(new Error('Could not save preferences!'));
      }
      default:
        // Start listening to messages coming from the content-script. Whenever a new
        // frame is created (either a main document or iframe), it will be requesting
        // cosmetics to inject in the DOM. Send back styles and scripts to inject to
        // block/hide trackers.
        return engine.onRuntimeMessage(msg, sender, sendResponse);
    }
  });
}

function launchExtension() {
  loadAdblocker()
    .then(((engine) => {
      handleTabs();
      handleConfig();
      handleRequest(engine);
      handleCommunication(engine);
    }))
    .catch((err) => { log(err); });
}

launchExtension();
