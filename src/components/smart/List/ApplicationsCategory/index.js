import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';

import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import log from '@misakey/helpers/log';
import { fetchApplicationsByCategory } from 'helpers/fetchApplications';

import Card from 'components/dumb/Card';
import ApplicationsList from 'components/dumb/List/Applications';
import Title from 'components/dumb/Typography/Title';

import routes from 'routes';


const ApplicationsCategory = ({ category, isAuthenticated, t }) => {
  const [error, setError] = useState();
  const [applicationsList, setList] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const shouldFetch = useMemo(
    () => !isFetching && isNil(applicationsList) && isNil(error),
    [isFetching, applicationsList, error],
  );

  const fetchApplicationsList = useCallback(() => {
    setIsFetching(true);

    return fetchApplicationsByCategory(category, { limit: 5 }, isAuthenticated)
      .then((response) => {
        setList(response.map(objectToCamelCase));
      })
      .catch((e) => {
        setError(e);
        log(e);
      })
      .finally(() => setIsFetching(false));
  }, [isAuthenticated, category]);

  useEffect(() => {
    if (shouldFetch) {
      fetchApplicationsList();
    }
  }, [shouldFetch, fetchApplicationsList]);

  return (
    <>
      <Title>
        {t(`application.category.${category}`)}
      </Title>
      <Card
        dense
        primary={{
          to: generatePath(routes.citizen.applications.category, { category }),
          component: Link,
          text: t('common:more'),
        }}
      >
        <ApplicationsList
          isFetching={isFetching}
          error={error}
          applications={applicationsList || []}
        />
      </Card>
    </>
  );
};

ApplicationsCategory.propTypes = {
  t: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool,
};

ApplicationsCategory.defaultProps = {
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: !!state.auth.token,
});

export default withTranslation('common')(connect(mapStateToProps)(ApplicationsCategory));
