import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import API from '@misakey/api';

import isNil from '@misakey/helpers/isNil';

import log from '@misakey/helpers/log';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import Box from '@material-ui/core/Box';
import Card from 'components/dumb/Card';
import Title from 'components/dumb/Typography/Title';
import ApplicationsList from 'components/dumb/List/Applications';


// CONSTANTS
const ENDPOINTS = {
  linkedApplications: {
    list: {
      method: 'GET',
      path: '/user-applications',
      auth: true,
    },
  },
  applicationInfo: {
    list: {
      method: 'GET',
      path: '/application-info',
      auth: false,
    },
  },
};


function LinkedApplicationsList({ t, userId, isAuthenticated }) {
  const [error, setError] = useState();
  const [list, setList] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const shouldFetch = useMemo(
    () => !isFetching && isAuthenticated && isNil(list) && isNil(error),
    [isFetching, isAuthenticated, list, error],
  );

  const fetchList = useCallback(() => {
    setIsFetching(true);
    return API.use(ENDPOINTS.linkedApplications.list)
      .build(null, null, objectToSnakeCase({ userId }))
      .send()
      .then((applicationLinksResponse) => {
        const applicationLinks = applicationLinksResponse.map(objectToCamelCase);
        const applicationIds = applicationLinks.map(
          (applicationLink) => applicationLink.applicationId,
        );

        return API.use(ENDPOINTS.applicationInfo.list)
          .build(null, null, { ids: applicationIds.join(',') })
          .send()
          .then((applicationResponse) => {
            const applications = applicationResponse.map(objectToCamelCase);
            setList(
              applicationLinks.map((applicationLink) => ({
                ...applications.find(
                  (application) => application.id === applicationLink.applicationId,
                ),
              })),
            );
          });
      })
      .catch((e) => {
        setError(e);
        log(e);
      })
      .finally(() => setIsFetching(false));
  }, [userId]);

  useEffect(() => {
    if (shouldFetch) {
      fetchList();
    }
  }, [shouldFetch, fetchList]);

  if (!isAuthenticated || (!isFetching && (isNil(list) || list.length === 0))) {
    return (
      <Box mb={3}>
        <Title align="center">
          {t('screens:landing.subtitle')}
        </Title>
      </Box>
    );
  }
  return (
    <Card
      title={t('linkedApplications.title')}
      mb={3}
    >
      <ApplicationsList
        isFetching={isFetching}
        error={error}
        applications={list || []}
      />
    </Card>
  );
}

LinkedApplicationsList.propTypes = {
  t: PropTypes.func.isRequired,
  userId: PropTypes.string,
  isAuthenticated: PropTypes.bool.isRequired,
};

LinkedApplicationsList.defaultProps = {
  userId: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  userId: state.auth.userId,
  isAuthenticated: !!state.auth.token,
});

export default connect(mapStateToProps)(withTranslation(['components', 'screens'])(LinkedApplicationsList));
