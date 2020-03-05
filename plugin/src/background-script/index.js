import log from '@misakey/helpers/log';
import common from '@misakey/ui/colors/common';

import globals from './globals';
import { setLocalStorage, initAuthIframe } from './auth';

import {
  setBadgeBackgroundColor,
  setBadgeTextColor,
} from './utils';


function handleConfig() {
  setBadgeBackgroundColor(common.misakey);
  const { name, version } = globals.BROWSER_INFOS;
  if (name === 'firefox' && version >= 63) {
    setBadgeTextColor(common.white);
  }
}

function handleCommunication() {
  browser.runtime.onConnect.addListener((externalPort) => {
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

function handleConnexion() {
  initAuthIframe();
}

function launchExtension() {
  try {
    handleCommunication();
    handleConnexion();
    handleConfig();
  } catch (err) {
    log(err);
  }
}

launchExtension();
