import React, { useCallback, useMemo } from 'react';

import PropTypes from 'prop-types';

import { APPBAR_HEIGHT, AVATAR_SIZE, LARGE_MULTIPLIER, LARGE } from '@misakey/ui/constants/sizes';
import { CONSENTED_SCOPES_KEY } from '@misakey/core/auth/constants/consent';
import { PROP_TYPES as REQUESTED_CONSENT_PROP_TYPES } from '@misakey/react/auth/constants/propTypes/requestedConsent';

import pluck from '@misakey/core/helpers/pluck';

import { useTranslation } from 'react-i18next';

import ListConsent from '@misakey/react/auth/components/List/Consent';
import Title from '@misakey/ui/Typography/Title';
import Box from '@material-ui/core/Box';
import BoxControls from '@misakey/ui/Box/Controls';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import CardSsoWithSlope from '@misakey/react/auth/components/Card/Sso/WithSlope';
import AvatarClientSso from '@misakey/ui/Avatar/Client/Sso';
import AppBar from '@misakey/ui/AppBar';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

// CONSTANTS
const SLOPE_PROPS = {
  // @FIXME approximate spacing to align card content with slope
  height: APPBAR_HEIGHT + AVATAR_SIZE * LARGE_MULTIPLIER + 126,
};

const CLIENT = window.env.SELF_CLIENT;

// HELPERS
const pluckScope = pluck('scope');

// COMPONENTS
const CardRequestedConsentMisakey = ({ consents, onSubmit, isFetching, onSignOut }) => {
  const { t } = useTranslation(['auth', 'common']);

  const primary = useMemo(() => ({ text: t('common:accept'), isLoading: isFetching }), [isFetching, t]);

  const consentScopes = useMemo(
    () => pluckScope(consents),
    [consents],
  );

  const initialValues = useMemo(
    () => ({
      [CONSENTED_SCOPES_KEY]: consentScopes,
    }),
    [consentScopes],
  );

  const handleSubmit = useCallback(
    ({ [CONSENTED_SCOPES_KEY]: consentedScopes }, ...rest) => {
      const consentedConsents = consents.filter(({ scope }) => consentedScopes.includes(scope));
      return onSubmit({ [CONSENTED_SCOPES_KEY]: consentedConsents }, ...rest);
    },
    [consents, onSubmit],
  );

  return (
    <CardSsoWithSlope
      slopeProps={SLOPE_PROPS}
      avatar={<AvatarClientSso client={CLIENT} />}
      avatarSize={LARGE}
      header={(
        <AppBar color="primary">
          <Button
            color="background"
            standing={BUTTON_STANDINGS.TEXT}
            onClick={onSignOut}
            text={(
              <>
                <ArrowBackIcon />
                {t('auth:login.secret.changeAccount')}
              </>
              )}
          />
        </AppBar>
      )}
    >
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
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
  onSignOut: PropTypes.func.isRequired,
  consents: PropTypes.arrayOf(PropTypes.shape(REQUESTED_CONSENT_PROP_TYPES)).isRequired,
  isFetching: PropTypes.bool,
};

CardRequestedConsentMisakey.defaultProps = {
  isFetching: false,
};

export default CardRequestedConsentMisakey;
