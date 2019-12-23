import React, { useState, useMemo, useCallback, useEffect } from 'react';
import API from '@misakey/api';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import parseJwt from '@misakey/helpers/parseJwt';
import tDefault from '@misakey/helpers/tDefault';
import isFunction from '@misakey/helpers/isFunction';
import isObject from '@misakey/helpers/isObject';
import nestedClasses from '@misakey/helpers/nestedClasses';

import CircularProgress from '@material-ui/core/CircularProgress';
import ButtonConnectNoToken from './NoToken';
import ButtonConnectToken from './Token';

// HELPERS
const getTokenClasses = (classes) => nestedClasses(classes, 'token', 'noToken');

const getNoTokenClasses = (classes) => nestedClasses(classes, 'noToken', 'token');

// HOOKS
const useUserId = (id) => useMemo(() => (id ? parseJwt(id).sub : undefined), [id]);

const useHandleSignIn = (onSignIn) => useCallback((event) => {
  if (isFunction(onSignIn)) {
    onSignIn(event);
  }
}, [onSignIn]);

const useUserData = (userId, setFetchingUser, handleSignIn) => useEffect(() => {
  if (userId) {
    setFetchingUser(true);

    API.use(API.endpoints.user.read)
      .build({ id: userId })
      .send()
      .then((response) => {
        handleSignIn(objectToCamelCase(response));
        setFetchingUser(false);
      })
      .catch(() => setFetchingUser(false));
  }
}, [userId, setFetchingUser, handleSignIn]);

// COMPONENTS
const ButtonConnect = ({
  AccountLink,
  buttonProps,
  className,
  classes,
  enqueueSnackbar,
  id,
  noTokenIcon,
  onSignIn,
  onSignOut,
  profile,
  signInAction,
  t,
  token,
  customAction,
}) => {
  const [isFetchingUser, setFetchingUser] = useState(false);

  const userId = useUserId(id);

  const tokenClasses = useMemo(
    () => (isObject(classes) ? getTokenClasses(classes) : null),
    [classes],
  );

  const noTokenClasses = useMemo(
    () => (isObject(classes) ? getNoTokenClasses(classes) : null),
    [classes],
  );

  const handleSignIn = useHandleSignIn(onSignIn);

  useUserData(userId, setFetchingUser, handleSignIn);

  return (
    <>
      {!token && (
        <ButtonConnectNoToken
          token={token}
          className={className}
          classes={noTokenClasses}
          buttonProps={buttonProps}
          Icon={noTokenIcon}
          signInAction={signInAction}
        >
          {t('account.signIn.label', 'Sign In')}
        </ButtonConnectNoToken>
      )}
      {isFetchingUser && <CircularProgress size={14} className={className} />}
      {(!isFetchingUser && token) && (
        <ButtonConnectToken
          AccountLink={AccountLink}
          className={className}
          classes={tokenClasses}
          enqueueSnackbar={enqueueSnackbar}
          id={id}
          onSignOut={onSignOut}
          profile={profile}
          token={token}
          customAction={customAction}
        />
      )}
    </>
  );
};

ButtonConnect.propTypes = {
  // COMPONENT
  AccountLink: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),

  buttonProps: PropTypes.object,
  classes: PropTypes.shape({
    noToken: PropTypes.object,
    token: PropTypes.object,
  }),
  className: PropTypes.string,
  customAction: PropTypes.func,
  enqueueSnackbar: PropTypes.func,
  id: PropTypes.string,

  // CALLBACKS
  noTokenIcon: PropTypes.node,
  onSignIn: PropTypes.func,

  onSignOut: PropTypes.func,
  profile: PropTypes.shape({
    avatarUri: PropTypes.string,
    displayName: PropTypes.string,
    email: PropTypes.string,
  }),
  signInAction: PropTypes.func.isRequired,
  t: PropTypes.func,
  token: PropTypes.string,
};

ButtonConnect.defaultProps = {
  AccountLink: Link,
  buttonProps: { color: 'secondary' },
  className: '',
  classes: null,
  enqueueSnackbar: null,
  id: null,
  noTokenIcon: null,
  onSignIn: null,
  onSignOut: null,
  profile: null,
  t: tDefault,
  token: null,
  customAction: null,
};

export default withTranslation()(ButtonConnect);
