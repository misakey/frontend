import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { connect } from 'react-redux';

import { IS_PLUGIN } from 'constants/plugin';
import { USER_REQUEST_STATUS } from 'constants/search/request/params';

import API from '@misakey/api';

import isNull from '@misakey/helpers/isNull';
import { setOnboardingDone } from '@misakey/helpers/plugin';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

import Redirect from 'components/dumb/Redirect';
import SearchApplications from 'components/smart/Search/Applications';
import UserRequests from 'components/smart/UserRequests';
import ApplicationCategoriesList from 'components/smart/List/ApplicationCategories';
import Screen from 'components/dumb/Screen';
import Onboarding from 'components/dumb/Onboarding/Citizen';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import { requestsByStatusNotEmptySelector } from 'store/reducers/screens/allRequestIds';

// CONSTANTS
const POPOVER_PROPS = {
  fixedHeight: true,
};
const FOOTER_PROPS = {
  FABPadded: true,
};

// HOOKS
const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
}));

// HELPERS
const countRequests = () => API.use(API.endpoints.request.count)
  .build()
  .send();

// COMPONENTS
const CitizenHome = ({ isAuthenticated, hasRequestsByStatus }) => {
  const classes = useStyles();
  const [userRequestCount, setUserRequestCount] = useState(null);

  const shouldFetch = useMemo(
    () => isAuthenticated && isNull(userRequestCount) && !hasRequestsByStatus,
    [hasRequestsByStatus, isAuthenticated, userRequestCount],
  );

  const onSuccess = useCallback((response) => {
    setUserRequestCount(parseInt(response.headers.get('X-Total-Count'), 10) || 0);
  }, []);

  const { isFetching } = useFetchEffect(
    countRequests,
    { shouldFetch },
    { onSuccess },
  );

  const userHasRequests = useMemo(
    () => hasRequestsByStatus || userRequestCount > 0,
    [hasRequestsByStatus, userRequestCount],
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
        <Box>
          {shouldDisplayOnboarding ? (
            <Onboarding isAuthenticated={isAuthenticated} />
          ) : (
            <UserRequests searchKey={USER_REQUEST_STATUS} />
          )}
          {!IS_PLUGIN && <ApplicationCategoriesList />}
        </Box>
      </Container>
      <SearchApplications popoverProps={POPOVER_PROPS} />
    </Screen>
  );
};

CitizenHome.propTypes = {
  isAuthenticated: PropTypes.bool,
  hasRequestsByStatus: PropTypes.bool,
};

CitizenHome.defaultProps = {
  isAuthenticated: false,
  hasRequestsByStatus: false,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  hasRequestsByStatus: requestsByStatusNotEmptySelector(state),
});

export default connect(mapStateToProps)(CitizenHome);
