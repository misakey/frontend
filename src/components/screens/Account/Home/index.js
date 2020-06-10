import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import IdentitySchema from 'store/schemas/Identity';

import isEmpty from '@misakey/helpers/isEmpty';

import CardIdentity from 'components/dumb/Card/Identity';
import Screen from 'components/dumb/Screen';

// COMPONENTS
const AccountHome = ({ identity, isFetching }) => {
  const state = useMemo(
    () => ({ isLoading: isFetching || isEmpty(identity) }),
    [isFetching, identity],
  );

  const preventSplashScreen = useMemo(
    () => !isEmpty(identity),
    [identity],
  );

  return (
    <Screen state={state} preventSplashScreen={preventSplashScreen}>
      <CardIdentity identity={identity} />
    </Screen>
  );
};

AccountHome.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  isFetching: PropTypes.bool,
};

AccountHome.defaultProps = {
  isFetching: false,
  identity: null,
};

export default AccountHome;
