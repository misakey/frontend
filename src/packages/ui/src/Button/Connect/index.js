import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import parseJwt from '@misakey/helpers/parseJwt';
import isFunction from '@misakey/helpers/isFunction';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import isObject from '@misakey/helpers/isObject';
import any from '@misakey/helpers/any';
import props from '@misakey/helpers/props';
import compose from '@misakey/helpers/compose';
import nestedClasses from '@misakey/helpers/nestedClasses';
import { getUserBuilder } from '@misakey/helpers/builder/users';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import CircularProgress from '@material-ui/core/CircularProgress';
import ButtonConnectNoToken from './NoToken';
import ButtonConnectToken from './Token';

// CONSTANTS
const PROFILE_PROPS = ['avatarUri', 'displayName', 'email'];

// HELPERS
const getTokenClasses = (classes) => nestedClasses(classes, 'token', 'noToken');
const getNoTokenClasses = (classes) => nestedClasses(classes, 'noToken', 'token');

const isAnyEmpty = any(isEmpty);
const isMissingProfileProps = compose(
  isAnyEmpty,
  props(PROFILE_PROPS),
);


// COMPONENTS
const ButtonConnect = ({
  AccountLink,
  buttonProps,
  className,
  classes,
  id,
  noTokenIcon,
  onSignIn,
  onSignOut,
  profile,
  signInAction,
  t,
  token,
  customAction,
  ...rest
}) => {
  const userId = useMemo(
    () => (id
      ? parseJwt(id).sub
      : undefined
    ),
    [id],
  );

  const shouldFetch = useMemo(
    () => !isNil(userId) && isMissingProfileProps(profile),
    [profile, userId],
  );

  const tokenClasses = useMemo(
    () => (isObject(classes) ? getTokenClasses(classes) : null),
    [classes],
  );

  const noTokenClasses = useMemo(
    () => (isObject(classes) ? getNoTokenClasses(classes) : null),
    [classes],
  );

  const noTokenProps = useMemo(
    () => (isFunction(signInAction) ? { onClick: signInAction } : {}),
    [signInAction],
  );

  const handleSignIn = useCallback((event) => {
    if (isFunction(onSignIn)) {
      onSignIn(event);
    }
  }, [onSignIn]);


  const getUserData = useCallback(
    () => getUserBuilder(userId),
    [userId],
  );

  const { isFetching: isFetchingUser } = useFetchEffect(
    getUserData,
    { shouldFetch },
    { onSuccess: handleSignIn },
  );

  return (
    <>
      {!token && (
        <ButtonConnectNoToken
          token={token}
          className={className}
          classes={noTokenClasses}
          buttonProps={buttonProps}
          Icon={noTokenIcon}
          {...noTokenProps}
          {...omitTranslationProps(rest)}
        >
          {t('components:buttonConnect.signIn')}
        </ButtonConnectNoToken>
      )}
      {isFetchingUser && <CircularProgress size={14} className={className} />}
      {(!isFetchingUser && token) && (
        <ButtonConnectToken
          AccountLink={AccountLink}
          className={className}
          classes={tokenClasses}
          id={id}
          onSignOut={onSignOut}
          profile={profile}
          token={token}
          customAction={customAction}
          {...omitTranslationProps(rest)}
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
  signInAction: PropTypes.func,
  t: PropTypes.func.isRequired,
  token: PropTypes.string,
};

ButtonConnect.defaultProps = {
  AccountLink: Link,
  buttonProps: { color: 'secondary' },
  className: '',
  classes: null,
  id: null,
  noTokenIcon: null,
  onSignIn: null,
  onSignOut: null,
  profile: null,
  signInAction: null,
  token: null,
  customAction: null,
};

export default withTranslation('components')(ButtonConnect);
