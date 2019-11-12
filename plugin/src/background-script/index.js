/*!
 * Copyright (c) 2017-2019 Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import log from '@misakey/helpers/log';
import common from '@misakey/ui/colors/common';

import globals from './globals';
import { setLocalStorage, initAuthIframe } from './auth';

import { getBlockingResponse, deserializeEngine } from './engine';
import { getItem } from './storage';
import {
  getCurrentTab,
  setBadgeBackgroundColor,
  setBadgeTextColor,
  setBadgeText,
  toggleBadgeAndIconOnPaused,
} from './utils';
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
  setBadgeBackgroundColor(common.misakey);
  const { name, version } = globals.BROWSER_INFOS;
  if (name === 'firefox' && version >= 63) {
    setBadgeTextColor(common.white);
  }
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
      setBadgeText(`${globals.counter.get(tabId) || 0}`);
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

    const { type, tabId } = details;
    // Reset tab infos in case of reload or url changes
    if (type === 'main_frame') {
      globals.initTabInfos(tabId);
      globals.updateActiveTrackerCounter(tabId, { reset: true });
    }

    // The request has match a rule
    if (rule) { globals.updateBlockingInfos(details, rule, hasToBeBlocked); }

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

    const { id } = await getCurrentTab();
    if (details.tabId === id) {
      // postMessage doesn't wait for a response
      globals.popupOpened.postMessage({
        action: 'refreshBlockedInfos',
        detectedTrackers: globals.getTabInfosForPopup(id),
      });
    }
  }, { urls: URLS_PATTERNS });
}

function handleCommunication(engine) {
  browser.runtime.onConnect.addListener((externalPort) => {
    // Follow a connection with the popup when it's opened in order to refresh information in popup
    // (cf. browser.webRequest.onErrorOccurred)
    if (externalPort.name === 'popup') {
      externalPort.onDisconnect.addListener(() => {
        globals.popupOpened = null;
      });

      globals.popupOpened = externalPort;
    }

    // Follow a connection with the misakey content-script to sync localStorage
    // between webapp and plugin
    if (externalPort.name === 'misakey-cs') {
      externalPort.onMessage.addListener((msg) => {
        if (msg.action === 'syncLocalStorage') {
          setLocalStorage(msg.misakeyLocalStorage);
          return Promise.resolve('success');
        }
        return Promise.reject(new Error('Fail to set localStorage'));
      });
    }
  });

  // Listener for other scripts messages. The main messages come from popup script
  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch (msg.action) {
      case 'getBlockerState': {
        const { pausedBlocking, pausedTime } = globals;
        return Promise.resolve({
          paused: pausedBlocking,
          pausedTime,
        });
      }
      case 'getCurrentTabResume':
        return Promise.all([getCurrentTab(), getItem('whitelist')]).then(([{ id }, { whitelist }]) => ({
          detectedTrackers: globals.getTabInfosForPopup(id),
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

function handleConnexion() {
  initAuthIframe();
}

function launchExtension() {
  loadAdblocker()
    .then(((engine) => {
      handleTabs();
      handleConfig();
      handleRequest(engine);
      handleCommunication(engine);
      handleConnexion();
    }))
    .catch((err) => {
      log(err);
      toggleBadgeAndIconOnPaused(true);
    });
}

launchExtension();
