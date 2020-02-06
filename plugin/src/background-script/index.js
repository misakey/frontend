/*!
 * Copyright (c) 2017-2019 Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import log from '@misakey/helpers/log';
import get from '@misakey/helpers/get';
import groupBy from '@misakey/helpers/groupBy';
import common from '@misakey/ui/colors/common';
import { Request } from '@cliqz/adblocker-webextension';

import globals from './globals';
import { setLocalStorage, initAuthIframe } from './auth';

import { getBlockingResponse, deserializeEngine } from './engine';
import { getItem, setItem } from './storage';
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
    if (changeInfo.url && globals.isBlockingActive()) {
      globals.tabsInitiator.set(tabId, changeInfo.url);
    }
  });

  browser.tabs.onActivated.addListener(({ tabId }) => {
    if (tabId > -1 && globals.isBlockingActive()) {
      // Popup extension has a tab = -1 : we don't want
      // to update counter if it's the 'newTab' is the popup
      setBadgeText(`${globals.counter.get(tabId) || 0}`);
    }
  });

  browser.tabs.onRemoved.addListener(({ tabId }) => {
    globals.removeTabsInfos(tabId);
  });
}

function handleUpdate() {
  browser.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
    if (reason === 'update' && previousVersion <= '1.4.0') {
      globals.pausedBlocking = false;
      setItem('pausedBlocking', false);
      setItem('onBoardingDone', true);
    } else if (reason === 'install') {
      globals.pausedBlocking = true;
      setItem('pausedBlocking', true);
    }
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
    const request = Request.fromRawDetails(details);
    const { blockingResponse, mainPurpose } = getBlockingResponse(engine, request, details);
    const hasToBeBlocked = Boolean(blockingResponse.cancel || blockingResponse.redirectUrl);

    const { tabId } = details;
    // Reset tab infos in case of reload or url changes
    if (request.isMainFrame()) {
      globals.initTabInfos(tabId);
      globals.updateActiveTrackerCounter(tabId, { reset: true });
    }

    // The request has match a rule
    if (mainPurpose) { globals.updateBlockingInfos(details, mainPurpose, hasToBeBlocked); }

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


function handleCommunication() {
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
}

function handleEngineMessage(engine) {
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
        return getCurrentTab().then(({ id }) => ({
          detectedTrackers: globals.getTabInfosForPopup(id),
        }));

      case 'getApps': {
        const getApps = msg.getAllThirdParties
          ? globals.getAllThirdPartiesApps(msg.search, msg.mainPurpose)
          : globals.getThirdPartyApps(msg.search, msg.mainPurpose);
        return Promise.all([getApps, getItem('whitelist')]).then(([apps, { whitelist }]) => {
          const whitelistedDomains = get(whitelist, 'apps', []);
          const { whitelisted, blocked } = groupBy(apps, (app) => (whitelistedDomains.includes(app.mainDomain) ? 'whitelisted' : 'blocked'));
          return { whitelisted: whitelisted || [], blocked: blocked || [] };
        });
      }
      case 'getWhitelist':
        return getItem('whitelist').then(({ whitelist }) => {
          const { apps } = whitelist || {};
          return apps || [];
        });

      case 'togglePauseBlocker':
        return Promise.resolve(globals.onPauseBlocker(msg.time));

      case 'updateWhitelist': {
        const { whitelistedDomains } = msg;
        const success = globals.updateWhitelist({ apps: whitelistedDomains });
        if (success) {
          return Promise.resolve(whitelistedDomains);
        }
        return Promise.reject(new Error('Could not save preferences!'));
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

function handleErrorCommunication() {
  browser.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'restart') {
      return browser.runtime.reload();
    }

    return Promise.reject(new Error('not_launched'));
  });
}

function handleConnexion() {
  initAuthIframe();
}

function launchExtension() {
  try {
    handleCommunication();
    handleConnexion();
    handleUpdate();
    handleConfig();

    loadAdblocker()
      .then(((engine) => {
        handleTabs();
        handleRequest(engine);
        handleEngineMessage(engine);
      }))
      .catch((err) => {
        log(err);
        handleErrorCommunication();
        toggleBadgeAndIconOnPaused(true);
      });
  } catch (err) {
    handleErrorCommunication();
    log(err);
  }
}

launchExtension();
