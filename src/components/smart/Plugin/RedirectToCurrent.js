/* eslint-disable no-redeclare */
/* global browser */

import React, { useEffect, useState, useMemo } from 'react';
import { Redirect, generatePath } from 'react-router-dom';
import routes from 'routes';
import { parse } from 'tldts';
import isNil from '@misakey/helpers/isNil';
import DefaultSplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import Screen from 'components/dumb/Screen';
import { isOnboardingDone } from '@misakey/helpers/plugin';

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

const STEPS = {
  loading: 0,
  onboarding: 1,
  started: 2,
};

function PluginRedirectToCurrent() {
  const [pluginDomain, setPluginDomain] = useState(null);
  const [step, setStep] = useState(STEPS.loading);

  const redirectPath = useMemo(
    () => (pluginDomain
      ? generatePath(routes.citizen.application._, { mainDomain: pluginDomain })
      : routes.plugin.blank
    ),
    [pluginDomain],
  );

  useEffect(() => {
    getCurrentTab().then(({ url }) => {
      const { hostname, domain } = parse(url);
      setPluginDomain(domain ? getMainDomainWithoutPrefix(hostname) : false);
    });
  }, []);

  // check if onboarding is needed
  useEffect(() => {
    isOnboardingDone().then((done) => {
      setStep(done === true ? STEPS.started : STEPS.onboarding);
    });
  }, []);

  if (step === STEPS.loading) {
    return (
      <Screen hideAppBar>
        <DefaultSplashScreen />
      </Screen>
    );
  }

  if (step === STEPS.onboarding) {
    return <Redirect to={routes.citizen._} />;
  }

  if (!isNil(pluginDomain)) {
    return <Redirect to={redirectPath} />;
  }
}

export default PluginRedirectToCurrent;
