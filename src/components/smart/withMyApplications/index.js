import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import identity from '@misakey/helpers/identity';
import isNil from '@misakey/helpers/isNil';
import propOr from '@misakey/helpers/propOr';

import { fetchUserRoleApplications, fetchLinkedApplications } from '@misakey/helpers/fetchApplications';

import { ROLE_LABELS } from 'constants/Roles';
import { WORKSPACE } from 'constants/workspaces';

import { receiveUserApplications } from 'store/actions/applications/userApplications';
import UserApplicationsSchema from 'store/schemas/UserApplications';
import ApplicationSchema from 'store/schemas/Application';
import { denormalize } from 'normalizr';

// HELPERS
const propOrNull = propOr(null);
const DEFAULT_WORKPACE = WORKSPACE.CITIZEN;

const useFetchFunction = (userId, workspace) => useCallback(
  () => ((workspace === WORKSPACE.DPO)
    ? fetchUserRoleApplications(userId, ROLE_LABELS.DPO)
    : fetchLinkedApplications(userId)),
  [userId, workspace],
);

// COMPONENTS
const withMyApplications = ({ mapper = identity, workspace = DEFAULT_WORKPACE }) => (Component) => {
  const Wrapper = (props) => {
    const { isAuthenticated, userId, myApplications, dispatch, ...rest } = props;
    const fetchFunction = useFetchFunction(userId, workspace);

    const shouldFetch = useMemo(
      () => isAuthenticated && isNil(myApplications),
      [isAuthenticated, myApplications],
    );

    const fetchApplications = useCallback(
      () => fetchFunction()
        .then((applications) => dispatch(receiveUserApplications({
          applications,
          workspace,
        }))),
      [dispatch, fetchFunction],
    );

    const { isFetching } = useFetchEffect(
      fetchApplications,
      { shouldFetch },
    );

    const mappedProps = useMemo(
      () => mapper({
        myApplications: {
          [workspace]: myApplications || [],
        },
        isFetchingMyApplications: isFetching,
        isAuthenticated,
        userId,
        ...rest,
      }),
      [isAuthenticated, isFetching, myApplications, rest, userId],
    );

    return <Component {...mappedProps} />;
  };

  Wrapper.propTypes = {
    // CONNECT
    myApplications: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
    isAuthenticated: PropTypes.bool,
    userId: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
  };

  Wrapper.defaultProps = {
    myApplications: null,
    userId: null,
    isAuthenticated: false,
  };

  // CONNECT
  const mapStateToProps = (state) => {
    const { userId, token } = state.auth;
    const denormalized = denormalize(
      workspace,
      UserApplicationsSchema.entity,
      state.entities,
    );
    return {
      isAuthenticated: !!token,
      userId,
      myApplications: propOrNull('applications', denormalized),
    };
  };

  return connect(mapStateToProps)(Wrapper);
};

export default withMyApplications;
