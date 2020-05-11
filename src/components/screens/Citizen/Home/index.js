import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { connect } from 'react-redux';

import { IS_PLUGIN } from 'constants/plugin';
import { USER_REQUEST_STATUS } from 'constants/search/request/params';
import { APPBAR_HEIGHT } from 'components/dumb/AppBar';
import { selectors } from 'store/reducers/userRequests/pagination';

import isNull from '@misakey/helpers/isNull';
import { setOnboardingDone } from '@misakey/helpers/plugin';
import { countUserRequestsBuilder } from '@misakey/helpers/builder/requests';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

import Redirect from 'components/dumb/Redirect';
import SearchApplications from 'components/smart/Search/Applications';
import UserRequests, { HEADER_HEIGHT } from 'components/smart/UserRequests';
import ApplicationCategoriesList from 'components/smart/List/ApplicationCategories';
import Screen, { FOOTER_SPACE } from 'components/dumb/Screen';
import Onboarding from 'components/dumb/Onboarding/Citizen';
import Container from '@material-ui/core/Container';

// CONSTANTS
const POPOVER_PROPS = {
  fixedHeight: true,
};
const FOOTER_PROPS = {
  FABPadded: true,
};

const LIST_MARGIN = 16;

const LIST_PROPS = {
  maxHeight: `calc(100vh - ${APPBAR_HEIGHT}px - ${FOOTER_SPACE}px - ${HEADER_HEIGHT}px - ${LIST_MARGIN}px)`,
};

// HOOKS
const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexGrow: 1,
  },
}));

// COMPONENTS
const CitizenHome = ({ isAuthenticated, isRequestsEmpty }) => {
  const classes = useStyles();
  const [userRequestCount, setUserRequestCount] = useState(null);

  const shouldFetch = useMemo(
    () => isAuthenticated && isNull(userRequestCount) && isRequestsEmpty,
    [isRequestsEmpty, isAuthenticated, userRequestCount],
  );

  const onSuccess = useCallback((count) => {
    setUserRequestCount(count || 0);
  }, []);

  const { isFetching } = useFetchEffect(
    countUserRequestsBuilder,
    { shouldFetch },
    { onSuccess },
  );

  const userHasRequests = useMemo(
    () => !isRequestsEmpty || userRequestCount > 0,
    [isRequestsEmpty, userRequestCount],
  );

  const state = useMemo(
    () => ({ isLoading: isFetching }),
    [isFetching],
  );

  const shouldDisplayOnboarding = useMemo(
    () => !isAuthenticated || !userHasRequests,
    [isAuthenticated, userHasRequests],
  );

  if (IS_PLUGIN && !shouldDisplayOnboarding) {
    setOnboardingDone();
    return <Redirect to={routes.plugin._} />;
  }

  return (
    <Screen state={state} footerProps={FOOTER_PROPS}>
      <Container maxWidth="md" className={classes.container}>
        {shouldDisplayOnboarding ? (
          <Onboarding isAuthenticated={isAuthenticated} />
        ) : (
          <UserRequests mb={2} listProps={LIST_PROPS} searchKey={USER_REQUEST_STATUS} />
        )}
        {!IS_PLUGIN && <ApplicationCategoriesList />}
      </Container>
      <SearchApplications popoverProps={POPOVER_PROPS} />
    </Screen>
  );
};

CitizenHome.propTypes = {
  isAuthenticated: PropTypes.bool,
  isRequestsEmpty: PropTypes.bool,
};

CitizenHome.defaultProps = {
  isAuthenticated: false,
  isRequestsEmpty: false,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  isRequestsEmpty: selectors.isEmpty(state),
});

export default connect(mapStateToProps)(CitizenHome);
