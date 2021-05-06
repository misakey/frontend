import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { APPBAR_HEIGHT, AVATAR_SIZE, LARGE_MULTIPLIER, LARGE } from '@misakey/ui/constants/sizes';
import { CONSENTED_SCOPES_KEY, MISAKEY_CONSENT_SCOPES } from '@misakey/core/auth/constants/consent';


import ListConsent from '@misakey/react/auth/components/List/Consent';
import Title from '@misakey/ui/Typography/Title';
import Box from '@material-ui/core/Box';
import BoxControls from '@misakey/ui/Box/Controls';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import CardSsoWithSlope from '@misakey/react/auth/components/Card/Sso/WithSlope';
import AvatarClientSso from '@misakey/ui/Avatar/Client/Sso';

// CONSTANTS
const INITIAL_VALUES = {
  [CONSENTED_SCOPES_KEY]: MISAKEY_CONSENT_SCOPES,
};

const SLOPE_PROPS = {
  // @FIXME approximate spacing to align card content with slope
  height: APPBAR_HEIGHT + AVATAR_SIZE * LARGE_MULTIPLIER + 126,
};

const CLIENT = window.env.SELF_CLIENT;

// COMPONENTS
const CardRequestedConsentMisakey = ({ onSubmit, isFetching }) => {
  const { t } = useTranslation(['auth', 'common']);

  const primary = useMemo(() => ({ text: t('common:accept'), isLoading: isFetching }), [isFetching, t]);

  return (
    <CardSsoWithSlope
      slopeProps={SLOPE_PROPS}
      avatar={<AvatarClientSso client={CLIENT} />}
      avatarSize={LARGE}
    >
      <Formik
        initialValues={INITIAL_VALUES}
        onSubmit={onSubmit}
      >
        <Box component={Form} display="flex" flexDirection="column">
          <Title align="center">
            {t('auth:consent.title')}
          </Title>
          <ListConsent
            tosUri={t('auth:tos.href')}
            policyUri={t('auth:privacy.href')}
          />
          <BoxControls
            formik
            primary={primary}
          />
        </Box>
      </Formik>
    </CardSsoWithSlope>
  );
};

CardRequestedConsentMisakey.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
};

CardRequestedConsentMisakey.defaultProps = {
  isFetching: false,
};

export default CardRequestedConsentMisakey;
