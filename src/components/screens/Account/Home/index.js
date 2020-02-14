import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import UserSchema from 'store/schemas/User';

import isEmpty from '@misakey/helpers/isEmpty';

import CardProfile from 'components/dumb/Card/Profile';
import Screen from 'components/dumb/Screen';

// COMPONENTS
const AccountHome = ({ profile, isFetching }) => {
  const state = useMemo(
    () => ({ isLoading: isFetching || isEmpty(profile) }),
    [isFetching, profile],
  );

  const preventSplashScreen = useMemo(
    () => !isEmpty(profile),
    [profile],
  );

  const appBarProps = useMemo(
    () => ({ items: [], withSearchBar: false }),
    [],
  );

  return (
    <Screen appBarProps={appBarProps} state={state} preventSplashScreen={preventSplashScreen}>
      <CardProfile profile={profile} />
    </Screen>
  );
};

AccountHome.propTypes = {
  profile: PropTypes.shape(UserSchema.propTypes),
  isFetching: PropTypes.bool,
};

AccountHome.defaultProps = {
  isFetching: false,
  profile: null,
};

export default AccountHome;
