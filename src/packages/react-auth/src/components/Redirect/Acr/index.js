import React, { useMemo } from 'react';

import PropTypes from 'prop-types';

import { TO_PROP_TYPE } from '@misakey/ui/constants/propTypes';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';

import { useSelector } from 'react-redux';

import { Redirect } from 'react-router-dom';

// CONSTANTS
const {
  acr: ACR_SELECTOR,
  isAuthenticated: IS_AUTHENTICATED_SELECTOR,
} = authSelectors;

// COMPONENTS
const RedirectAcr = ({ redirect: RedirectComponent, acr, to, ...rest }) => {
  const currentAcr = useSelector(ACR_SELECTOR);
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const noAcr = useMemo(
    () => isNil(currentAcr),
    [currentAcr],
  );

  if (noAcr && isAuthenticated) {
    throw new Error('authenticated with no acr');
  }

  if (noAcr || currentAcr <= acr) {
    return <RedirectComponent to={to} {...rest} />;
  }

  return null;
};



RedirectAcr.propTypes = {
  redirect: PropTypes.elementType,
  acr: PropTypes.number.isRequired,
  to: TO_PROP_TYPE.isRequired,
};

RedirectAcr.defaultProps = {
  redirect: Redirect,
};

export default RedirectAcr;
