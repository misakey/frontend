import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { Link, useParams, generatePath } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import isNil from '@misakey/helpers/isNil';

import { BUTTON_STANDINGS } from 'components/dumb/Button';
import ButtonConnectSimple from 'components/dumb/Button/Connect/Simple';
import Onboarding, { OnboardingStep } from 'components/dumb/Onboarding';

import { ROLE_LABELS } from 'constants/Roles';

const WORKSPACE = ROLE_LABELS.DPO;

const OnboardingDPO = ({ isAuthenticated, t }) => {
  const [activeStep, setActiveStep] = useState(1);
  const { mainDomain } = useParams();
  const redirectToActivate = useMemo(
    () => {
      if (!isNil(mainDomain)) {
        return generatePath(routes.dpo.service.claim._, { mainDomain });
      }
      return routes.dpo.services.create;
    },
    [mainDomain],
  );

  // compute user's step for onboarding
  useEffect(() => {
    if (!isAuthenticated) {
      setActiveStep(1);
    } else {
      setActiveStep(2);
    }
  }, [isAuthenticated]);

  return (
    <Onboarding workspace={ROLE_LABELS.DPO}>
      <OnboardingStep
        isActive={activeStep === 1}
        step={1}
        workspace={WORKSPACE}
        button={{
          standing: BUTTON_STANDINGS.MAIN,
          text: t(`components__new:onboarding.${WORKSPACE}.steps.1.button`),
          component: ButtonConnectSimple,
        }}
      />
      <OnboardingStep
        isActive={activeStep === 2}
        step={2}
        workspace={WORKSPACE}
        button={{
          standing: BUTTON_STANDINGS.MAIN,
          text: t(`components__new:onboarding.${WORKSPACE}.steps.2.button`),
          component: Link,
          to: redirectToActivate,
        }}
      />
    </Onboarding>
  );
};

OnboardingDPO.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('components__new')(OnboardingDPO);
