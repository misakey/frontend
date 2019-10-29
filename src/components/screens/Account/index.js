import React, { Suspense, lazy, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';

import { connect } from 'react-redux';
import { denormalize } from 'normalizr';

import UserSchema from 'store/schemas/User';

import isObject from '@misakey/helpers/isObject';
import isNil from '@misakey/helpers/isNil';
import propOr from '@misakey/helpers/propOr';
import isDataUrl from '@misakey/helpers/isDataUrl';

import API from '@misakey/api';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import useAsync from '@misakey/hooks/useAsync';

import { userProfileReceive } from 'store/actions/screens/account';

import SplashScreen from 'components/dumb/SplashScreen';
import ScreenError from 'components/dumb/Screen/Error';
import Footer from 'components/dumb/Footer';
import Container from '@material-ui/core/Container';

import routes from 'routes';

import 'components/screens/Account/index.scss';

// LAZY
const AccountHome = lazy(() => import('components/screens/Account/Home'));
const AccountName = lazy(() => import('components/screens/Account/Name'));
const AccountAvatar = lazy(() => import('components/screens/Account/Avatar'));
const AccountPassword = lazy(() => import('components/screens/Account/Password'));

// HELPERS
const getAvatarUri = propOr('', 'avatarUri');
const getProfileId = (profile) => {
  if (isObject(profile)) { return profile.id; }
  return null;
};

const shouldFetch = (entity, isFetching) => {
  if (isFetching) { return false; }
  return (isNil(entity) || isDataUrl(getAvatarUri(entity)));
};

const fetchProfile = (id) => API.use(API.endpoints.user.read).build({ id }).send();
const getGetProfile = (
  profileId, entity, isFetching, dispatchReceive, setIsFetching, setError,
) => () => {
  if (shouldFetch(entity, isFetching) && !isNil(profileId)) {
    setIsFetching(true);
    return fetchProfile(profileId)
      .then((response) => {
        const data = objectToCamelCase(response);
        dispatchReceive(data);
        setIsFetching(false);
      })
      .catch(({ httpStatus }) => {
        setError(httpStatus);
        setIsFetching(false);
      });
  }
  return null;
};

// HOOKS
const useProfileId = (profile) => useMemo(() => getProfileId(profile), [profile]);

const useGetProfile = (...args) => useMemo(
  () => getGetProfile(...args),
  [args],
);


// COMPONENTS
const Account = ({ profile, entity, dispatchReceive }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();
  const profileId = useProfileId(profile);

  const getProfile = useGetProfile(
    profileId, entity, isFetching, dispatchReceive, setIsFetching, setError,
  );

  useAsync(getProfile, getAvatarUri(entity));

  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  return (
    <div className="account">
      <Container maxWidth={false}>
        <div className="flexWrapper">
          <Suspense fallback={<SplashScreen />}>
            <Switch>
              <Route
                exact
                path={routes.account._}
                render={(routerProps) => <AccountHome profile={entity} {...routerProps} />}
              />
              <Route
                exact
                path={routes.account.profile.name}
                render={(routerProps) => <AccountName profile={entity} {...routerProps} />}
              />
              <Route
                path={routes.account.profile.avatar._}
                render={(routerProps) => <AccountAvatar profile={entity} {...routerProps} />}
              />
              <Route
                exact
                path={routes.account.profile.password}
                render={(routerProps) => <AccountPassword profile={entity} {...routerProps} />}
              />
            </Switch>
          </Suspense>
          <Footer />
        </div>
      </Container>
    </div>
  );
};

Account.propTypes = {
  // CONNECT
  // - STATE
  profile: PropTypes.shape({
    id: PropTypes.string,
  }),
  entity: PropTypes.object,
  // - DISPATCH
  dispatchReceive: PropTypes.func.isRequired,
};

Account.defaultProps = {
  profile: null,
  entity: null,
};

// CONNECT
const mapStateToProps = (state) => {
  const { profile } = state.auth;
  return {
    profile,
    entity: isNil(profile) ? null : denormalize(
      profile.id,
      UserSchema.entity,
      state.entities,
    ),
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatchReceive: (data) => {
    dispatch(userProfileReceive(data));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Account);
