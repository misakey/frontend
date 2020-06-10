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
import { getIdentity as getIdentityBuilder } from '@misakey/auth/builder/identities';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import CircularProgress from '@material-ui/core/CircularProgress';
import ButtonConnectNoToken from './NoToken';
import ButtonConnectToken from './Token';

// CONSTANTS
const IDENTITY_PROPS = ['avatarUrl', 'displayName', 'id'];

// HELPERS
const getTokenClasses = (classes) => nestedClasses(classes, 'token', 'noToken');
const getNoTokenClasses = (classes) => nestedClasses(classes, 'noToken', 'token');

const isAnyEmpty = any(isEmpty);
const isMissingIdentityProps = compose(
  isAnyEmpty,
  props(IDENTITY_PROPS),
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
  identity,
  signInAction,
  t,
  token,
  customAction,
  ...rest
}) => {
  const identityId = useMemo(
    () => (id
      ? parseJwt(id).sub
      : undefined
    ),
    [id],
  );

  const shouldFetch = useMemo(
    () => !isNil(identityId) && isMissingIdentityProps(identity),
    [identity, identityId],
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
    () => getIdentityBuilder(identityId),
    [identityId],
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
          identity={identity}
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
  identity: PropTypes.shape({
    avatarUrl: PropTypes.string,
    displayName: PropTypes.string,
    id: PropTypes.string,
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
  identity: null,
  signInAction: null,
  token: null,
  customAction: null,
};

export default withTranslation('components')(ButtonConnect);
