/* eslint-disable no-redeclare */
/* global browser */

import React, { useEffect, useState } from 'react';
import { Redirect, generatePath } from 'react-router-dom';
import routes from 'routes';
import { parse } from 'tldts';

import DefaultScreen from './DefaultScreen';

// @TODO add o js-common helpers
async function getCurrentTab() {
  const tabs = await browser.tabs.query({ currentWindow: true, active: true });
  return tabs[0] || {};
}

function Plugin() {
  const [pluginDomain, setPluginDomain] = useState(null);

  useEffect(() => {
    getCurrentTab().then(({ url }) => {
      const { domain } = parse(url);
      setPluginDomain(domain);
    });
  }, []);

  if (pluginDomain) {
    const path = generatePath(routes.citizen.application.thirdParty, { mainDomain: pluginDomain });
    return <Redirect to={path} />;
  }

  return <DefaultScreen />;
}

export default Plugin;
