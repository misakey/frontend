import React, { useMemo, useCallback } from 'react';
import moment from 'moment';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { getCurrentUserSelector, selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';

import Box from '@material-ui/core/Box';
import TitleBold from '@misakey/ui/Typography/Title/Bold';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import CardUserSignOut from '@misakey/react/auth/components/Card/User/SignOut';
import BoxControlsCard from '@misakey/ui/Box/Controls/Card';

// CONSTANTS
const { acr: getCurrentAcrSelector, expiresAt: EXPIRES_AT_SELECTOR } = authSelectors;

// COMPONENTS
const DialogSigninRedirectUser = ({
  onSignInRedirect, title: defaultTitle, subtitle: defaultSubtitle, acrValues,
}) => {
  const { t } = useTranslation(['common', 'components']);
  const currentUser = useSelector(getCurrentUserSelector);
  const currentAcr = useSelector(getCurrentAcrSelector);

  const expiresAt = useSelector(EXPIRES_AT_SELECTOR);

  const sessionExpired = useMemo(
    () => (!isNil(expiresAt) ? moment().isAfter(expiresAt) : false),
    [expiresAt],
  );

  const insufficientACR = useMemo(
    () => !isEmpty(currentUser) && !isNil(currentAcr) && currentAcr < acrValues,
    [acrValues, currentAcr, currentUser],
  );

  const title = useMemo(
    () => {
      if (sessionExpired) {
        return t('components:signinRedirect.user.expired.title');
      }
      if (insufficientACR) {
        return t(`components:signinRedirect.user.insufficientACR.${acrValues}.title`);
      }
      return defaultTitle;
    },
    [sessionExpired, insufficientACR, defaultTitle, t, acrValues],
  );

  const subtitle = useMemo(
    () => {
      if (sessionExpired) {
        return t('components:signinRedirect.user.expired.subtitle');
      }
      if (insufficientACR) {
        return t(`components:signinRedirect.user.insufficientACR.${acrValues}.subtitle`);
      }
      return defaultSubtitle;
    },
    [sessionExpired, insufficientACR, defaultSubtitle, t, acrValues],
  );

  const onClick = useCallback(() => onSignInRedirect(), [onSignInRedirect]);
  const text = useMemo(() => (sessionExpired ? t('common:continue') : t('common:validate')), [sessionExpired, t]);

  return (
    <Box>
      <TitleBold align="center" gutterBottom={false}>{title}</TitleBold>
      <Subtitle align="center">{subtitle}</Subtitle>
      <CardUserSignOut my={3} expired={sessionExpired} />
      <BoxControlsCard primary={{ text, onClick }} />
    </Box>
  );
};

DialogSigninRedirectUser.propTypes = {
  acrValues: PropTypes.number,
  title: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  subtitle: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  onSignInRedirect: PropTypes.func.isRequired,
};

DialogSigninRedirectUser.defaultProps = {
  acrValues: null,
};

export default DialogSigninRedirectUser;
