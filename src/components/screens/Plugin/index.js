/* eslint-disable no-redeclare */
/* global browser */

import React, { useEffect, useState } from 'react';
import { Redirect, generatePath } from 'react-router-dom';
import routes from 'routes';
import { parse } from 'tldts';

import DefaultScreen from './DefaultScreen';

// @FIXME add to js-common helpers
async function getCurrentTab() {
  const tabs = await browser.tabs.query({ currentWindow: true, active: true });
  return tabs[0] || {};
}

// @FIXME add to js-common helpers
function getMainDomainWithoutPrefix(domain) {
  if (domain.startsWith('www.')) {
    return domain.replace('www.', '');
  }
  return domain;
}

function Plugin() {
  const [pluginDomain, setPluginDomain] = useState(null);

  useEffect(() => {
    getCurrentTab().then(({ url }) => {
      const { hostname, domain } = parse(url);
      if (domain) {
        setPluginDomain(getMainDomainWithoutPrefix(hostname));
      }
    });
  }, []);

  if (pluginDomain) {
    const path = generatePath(routes.citizen.application.vault, { mainDomain: pluginDomain });
    return <Redirect to={path} />;
  }

  return <DefaultScreen />;
}

export default Plugin;
