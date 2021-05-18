import React, { useCallback } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { LARGE, APPBAR_HEIGHT, AVATAR_SIZE, LARGE_MULTIPLIER } from '@misakey/ui/constants/sizes';
import { openVaultValidationSchema } from '@misakey/react/auth/constants/validationSchemas/vault';
import { PREHASHED_PASSWORD } from '@misakey/react/auth/constants/account/password';
import { invalid } from '@misakey/core/api/constants/errorTypes';
import {
  DecryptionError,
} from '@misakey/core/crypto/Errors/classes';

import logSentryException from '@misakey/core/helpers/log/sentry/exception';

import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import makeStyles from '@material-ui/core/styles/makeStyles';

import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import FormField from '@misakey/ui/Form/Field';
import FormHelperTextInCard from '@misakey/ui/FormHelperText/InCard';
import CardUserSignOut from '@misakey/react/auth/components/Card/User/SignOut';
import FieldPasswordRevealable from '@misakey/ui/Form/Field/Password/Revealable';
import BoxControlsCard from '@misakey/ui/Box/Controls/Card';
import Box from '@material-ui/core/Box';
import CardSsoWithSlope from '@misakey/react/auth/components/Card/Sso/WithSlope';
import TitleBold from '@misakey/ui/Typography/Title/Bold';

// CONSTANTS
const INITIAL_VALUES = {
  [PREHASHED_PASSWORD]: '',
};

const SLOPE_PROPS = {
  // @FIXME approximate spacing to align card content with slope
  height: APPBAR_HEIGHT + AVATAR_SIZE * LARGE_MULTIPLIER + 102,
};

// HOOKS
const useStyles = makeStyles(() => ({
  cardOverflowVisible: {
    overflow: 'visible',
  },
}));

// COMPONENTS
const LockedScreen = ({
  avatar, header, secondary,
  displayName, avatarUrl, identifierValue,
  onSignOut, onUnlock, ...rest
}) => {
  const classes = useStyles();
  const { t } = useTranslation(['common', 'components']);

  const onSubmit = useCallback(
    async ({ [PREHASHED_PASSWORD]: password }, { setFieldError }) => {
      try {
        await onUnlock(password);
      } catch (error) {
        if (error instanceof DecryptionError) {
          setFieldError(PREHASHED_PASSWORD, invalid);
          return;
        }
        logSentryException(error, 'opening vault with password', { crypto: true });
      }
    },
    [onUnlock],
  );

  useUpdateDocHead(t('components:lockedScreen.documentTitle'));

  return (
    <CardSsoWithSlope
      slopeProps={SLOPE_PROPS}
      avatar={avatar}
      avatarSize={LARGE}
      header={header}
      {...rest}
    >
      <Formik
        onSubmit={onSubmit}
        initialValues={INITIAL_VALUES}
        validationSchema={openVaultValidationSchema}
      >
        <Box
          component={Form}
          display="flex"
          flexDirection="column"
          width="100%"
          justifyContent="center"
        >
          <TitleBold align="center" gutterBottom={false}>{t('components:lockedScreen.text')}</TitleBold>
          <CardUserSignOut
            my={3}
            className={classes.cardOverflowVisible}
            avatarUrl={avatarUrl}
            displayName={displayName}
            identifier={identifierValue}
            onSuccess={onSignOut}
          >
            <FormField
              name={PREHASHED_PASSWORD}
              variant="filled"
              component={FieldPasswordRevealable}
              helperText={t('components:lockedScreen.helperText')}
              margin="none"
              inputProps={{ 'data-matomo-ignore': true }}
              FormHelperTextProps={{ component: FormHelperTextInCard }}
              fullWidth
              autoFocus
            />
          </CardUserSignOut>
          <BoxControlsCard
            primary={{
              type: 'submit',
              text: t('common:unlock'),
            }}
            secondary={secondary}
            formik
          />
        </Box>
      </Formik>
    </CardSsoWithSlope>
  );
};

LockedScreen.propTypes = {
  header: PropTypes.node,
  avatar: PropTypes.node,
  secondary: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
  displayName: PropTypes.string,
  avatarUrl: PropTypes.string,
  identifierValue: PropTypes.string,
  onUnlock: PropTypes.func.isRequired,
  onSignOut: PropTypes.func,
};

LockedScreen.defaultProps = {
  header: null,
  avatar: null,
  secondary: null,
  onSignOut: null,
  displayName: null,
  avatarUrl: null,
  identifierValue: null,
};

export default LockedScreen;
