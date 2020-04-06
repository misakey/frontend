import React, { useCallback, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { IS_PLUGIN } from 'constants/plugin';

// import { FIREFOX_ADDON_URI, CHROME_ADDON_URI } from 'constants/links/addon';

import routes from 'routes';
import { redirectToApp, isPluginDetected } from '@misakey/helpers/plugin';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';
// import CardSimpleDoubleButton from 'components/dumb/Card/Simple/DoubleButton';
import ButtonConnectSimple from 'components/dumb/Button/Connect/Simple';
import Onboarding, { OnboardingStep } from 'components/dumb/Onboarding';

import { ROLE_LABELS } from 'constants/Roles';

const WORKSPACE = ROLE_LABELS.CITIZEN;

const OnboardingCitizen = ({ isAuthenticated, t }) => {
  const [activeStep, setActiveStep] = useState(1);

  const isPluginInstalled = useMemo(() => isPluginDetected(), []);

  const redirectToAppForPlugin = useCallback(() => {
    if (IS_PLUGIN) {
      redirectToApp(routes.citizen.applications.categories);
      window.close();
    }
  }, []);

  // compute user`s step for onboarding
  useEffect(() => {
    if (!isAuthenticated) {
      setActiveStep(1);
    // } else if (!isPluginInstalled && !IS_PLUGIN) {
    //   setActiveStep(2);
    } else {
      setActiveStep(3);
    }
  }, [isAuthenticated, isPluginInstalled]);

  return (
    <Onboarding workspace={ROLE_LABELS.CITIZEN}>
      <OnboardingStep
        isActive={activeStep === 1}
        step={1}
        workspace={WORKSPACE}
        button={{
          standing: BUTTON_STANDINGS.MAIN,
          text: t(`components:onboarding.${WORKSPACE}.steps.1.button`),
          component: ButtonConnectSimple,
        }}
      />
      {/* <OnboardingStep
        isActive={activeStep === 2}
        step={2}
        workspace={WORKSPACE}
        component={CardSimpleDoubleButton}
        primary={{
          standing: BUTTON_STANDINGS.MAIN,
          text: t(`components:onboarding.${WORKSPACE}.steps.2.firefox`),
          href: FIREFOX_ADDON_URI,
          component: 'a',
        }}
        secondary={{
          standing: BUTTON_STANDINGS.MAIN,
          text: t(`components:onboarding.${WORKSPACE}.steps.2.chrome`),
          href: CHROME_ADDON_URI,
          component: 'a',
        }}
      /> */}
      <OnboardingStep
        isActive={activeStep === 3}
        step={3}
        workspace={WORKSPACE}
        button={{
          standing: BUTTON_STANDINGS.MAIN,
          text: t(`components:onboarding.${WORKSPACE}.steps.3.button`),
          component: Link,
          to: IS_PLUGIN ? routes.plugin._ : routes.citizen.applications.categories,
          onClick: redirectToAppForPlugin,
        }}
      />
    </Onboarding>
  );
};

OnboardingCitizen.propTypes = {
  isAuthenticated: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

OnboardingCitizen.defaultProps = {
  isAuthenticated: false,
};

export default withTranslation('components')(OnboardingCitizen);
