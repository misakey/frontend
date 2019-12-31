import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import API from '@misakey/api';
import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import log from '@misakey/helpers/log';

import Card from 'components/dumb/Card';
import ApplicationsList from 'components/dumb/List/Applications';

// CONSTANTS
const ENDPOINTS = {
  applicationInfo: {
    list: {
      method: 'GET',
      path: '/application-info',
      auth: false,
    },
  },
};

const ApplicationsCategory = ({ categoryName, applicationsDomains }) => {
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

    return API.use(ENDPOINTS.applicationInfo.list)
      .build(null, null, { main_domains: applicationsDomains.join(',') })
      .send()
      .then((response) => {
        setList(response.map(objectToCamelCase));
      })
      .catch((e) => {
        setError(e);
        log(e);
      })
      .finally(() => setIsFetching(false));
  }, [applicationsDomains]);

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
};

export default ApplicationsCategory;
