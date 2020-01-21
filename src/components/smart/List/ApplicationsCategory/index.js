import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import log from '@misakey/helpers/log';
import { fetchApplicationsByMainDomains } from 'helpers/fetchApplications';

import Card from 'components/dumb/Card';
import ApplicationsList from 'components/dumb/List/Applications';


const ApplicationsCategory = ({ categoryName, applicationsDomains, isAuthenticated }) => {
  const [error, setError] = useState();
  const [applicationsList, setList] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const listLength = useMemo(() => applicationsDomains.length, [applicationsDomains]);

  const shouldFetch = useMemo(
    () => !isFetching && isNil(applicationsList) && isNil(error),
    [isFetching, applicationsList, error],
  );

  const fetchApplicationsList = useCallback(() => {
    setIsFetching(true);

    return fetchApplicationsByMainDomains(applicationsDomains, isAuthenticated)
      .then((response) => {
        setList(response.map(objectToCamelCase));
      })
      .catch((e) => {
        setError(e);
        log(e);
      })
      .finally(() => setIsFetching(false));
  }, [applicationsDomains, isAuthenticated]);

  useEffect(() => {
    if (shouldFetch) {
      fetchApplicationsList();
    }
  }, [shouldFetch, fetchApplicationsList]);

  return (
    <Card
      title={categoryName}
    >
      <ApplicationsList
        isFetching={isFetching}
        error={error}
        applications={applicationsList || []}
        listLength={listLength}
      />
    </Card>
  );
};

ApplicationsCategory.propTypes = {
  categoryName: PropTypes.string.isRequired,
  applicationsDomains: PropTypes.arrayOf(PropTypes.string).isRequired,
  isAuthenticated: PropTypes.bool,
};

ApplicationsCategory.defaultProps = {
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: !!state.auth.token,
});

export default connect(mapStateToProps)(ApplicationsCategory);
