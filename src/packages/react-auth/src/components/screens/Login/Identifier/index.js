import React, { useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';

import { STEP, INITIAL_VALUES, ERROR_KEYS } from '@misakey/auth/constants';
import { identifierValidationSchema } from '@misakey/auth/constants/validationSchemas/auth';
import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/react-auth/store/reducers/sso';
import { APPBAR_HEIGHT, AVATAR_SIZE, LARGE_MULTIPLIER } from '@misakey/ui/constants/sizes';
import { LARGE } from '@misakey/ui/Avatar';

import compose from '@misakey/helpers/compose';
import head from '@misakey/helpers/head';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import props from '@misakey/helpers/props';
import { getDetails } from '@misakey/helpers/apiError';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useOnIdentifierSubmit from 'hooks/useOnIdentifierSubmit';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import CardUser from '@misakey/react-auth/components/Card/User';
import LoginFormField from '@misakey/ui/Form/Field/Login/Identifier';
import SecretHiddenFormField from '@misakey/ui/Form/Field/Login/Secret/Hidden';
import BoxControls from '@misakey/ui/Box/Controls';
import AvatarClientSso from '@misakey/ui/Avatar/Client/Sso';
import CardSsoWithSlope from '@misakey/react-auth/components/Card/Sso/WithSlope';
import AvatarBox from '@misakey/ui/Avatar/Box';
import TransRequireAccess from '@misakey/ui/Trans/RequireAccess';
import FormHelperTextInCard from '@misakey/ui/FormHelperText/InCard';

// CONSTANTS
const CURRENT_STEP = STEP.identifier;
const SLOPE_PROPS = {
  // @FIXME approximate spacing to align card content with slope
  height: APPBAR_HEIGHT + AVATAR_SIZE * LARGE_MULTIPLIER + 116,
};

// HELPERS
const getIdentifierError = compose(
  head,
  (errors) => errors.filter((error) => !isNil(error)),
  props(ERROR_KEYS[CURRENT_STEP]),
);

// HOOKS
const useStyles = makeStyles((theme) => ({
  boldTitle: {
    fontWeight: theme.typography.fontWeightBold,
  },
  screenContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    overflow: 'auto',
  },
}));

// COMPONENTS
const AuthLoginIdentifier = ({
  loginChallenge,
  client,
  identifier,
  resourceName,
  t,
}) => {
  const classes = useStyles();
  const handleHttpErrors = useHandleHttpErrors();

  const initialValues = useMemo(
    () => ({
      ...INITIAL_VALUES[CURRENT_STEP],
      identifier,
    }),
    [identifier],
  );

  const { name } = useSafeDestr(client);

  const onIdentifierSubmit = useOnIdentifierSubmit(loginChallenge);

  const onSubmit = useCallback(
    (
      { identifier: nextIdentifier },
      { setFieldError },
    ) => onIdentifierSubmit(nextIdentifier)
      .catch((e) => {
        const details = getDetails(e);
        const identifierError = getIdentifierError(details);

        if (!isNil(identifierError)) {
          setFieldError(CURRENT_STEP, identifierError);
        } else {
          handleHttpErrors(e);
        }
      }),
    [onIdentifierSubmit, handleHttpErrors],
  );

  const primary = useMemo(() => ({ text: t('common:next') }), [t]);

  return (
    <CardSsoWithSlope
      avatar={!isEmpty(resourceName) && resourceName !== name ? (
        <AvatarBox title={resourceName} size={LARGE} />
      ) : (
        <AvatarClientSso client={client} />
      )}
      slopeProps={SLOPE_PROPS}
      avatarLarge
    >
      <Formik
        initialValues={initialValues}
        validationSchema={identifierValidationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        <Form>
          <Title align="center" gutterBottom={false}>
            <Trans i18nKey="auth:login.identifier.title" values={{ resourceName: isEmpty(resourceName) ? name : resourceName }}>
              <span className={classes.boldTitle}>{'{{resourceName}}'}</span>
            </Trans>
          </Title>
          <Subtitle align="center">
            <TransRequireAccess i18nKey="auth:login.identifier.requireAccess.title" />
          </Subtitle>
          <CardUser
            hideSkeleton
            my={3}
          >
            <LoginFormField
              FormHelperTextProps={{ component: FormHelperTextInCard }}
              margin="none"
            />
            <SecretHiddenFormField />
          </CardUser>
          <BoxControls formik primary={primary} />
        </Form>
      </Formik>
    </CardSsoWithSlope>
  );
};

AuthLoginIdentifier.propTypes = {
  loginChallenge: PropTypes.string.isRequired,
  identifier: PropTypes.string.isRequired,
  client: SSO_PROP_TYPES.client.isRequired,
  resourceName: PropTypes.string,
  // withTranslation
  t: PropTypes.func.isRequired,
};

AuthLoginIdentifier.defaultProps = {
  resourceName: '',
};

export default withTranslation(['auth', 'common'])(AuthLoginIdentifier);
