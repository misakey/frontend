import React, { useEffect, useState } from 'react';
import { Redirect, generatePath } from 'react-router-dom';

import routes from 'routes';

import { sendMessage } from 'background';
import { GET_CURRENT_DOMAIN } from 'background/messages';

import DefaultScreen from './DefaultScreen';

function Plugin() {
  const [pluginDomain, setPluginDomain] = useState(null);

  useEffect(() => {
    if (window.env.PLUGIN) {
      sendMessage(GET_CURRENT_DOMAIN).then((domain) => {
        setPluginDomain(domain);
      });
    }
  }, []);

  if (pluginDomain) {
    const path = generatePath(routes.citizen.application.thirdParty, { mainDomain: pluginDomain });
    return <Redirect to={path} />;
  }

  return <DefaultScreen />;
}

export default Plugin;
