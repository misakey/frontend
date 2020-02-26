import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import log from '@misakey/helpers/log';
import { fetchApplicationsByCategory } from '@misakey/helpers/fetchApplications';

import Container from '@material-ui/core/Container';
import AppBarNavigation from 'components/dumb/AppBar/Navigation';


import ApplicationsList from 'components/dumb/List/Applications';
import Screen from 'components/dumb/Screen';


const ApplicationsCategoryScreen = ({ isAuthenticated, t, match }) => {
  const [error, setError] = useState();
  const [applicationsList, setList] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const { category } = match.params;

  const shouldFetch = useMemo(
    () => !isFetching && isNil(applicationsList) && isNil(error),
    [isFetching, applicationsList, error],
  );

  const fetchApplicationsList = useCallback(() => {
    setIsFetching(true);

    return fetchApplicationsByCategory(category, {}, isAuthenticated)
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
    <Screen>
      <AppBarNavigation
        toolbarProps={{ maxWidth: 'md' }}
        title={t(`common__new:application.category.${category}`)}
      />
      <Container
        maxWidth="md"
      >
        <ApplicationsList
          isFetching={isFetching}
          error={error}
          applications={applicationsList || []}
        />
      </Container>
    </Screen>
  );
};

ApplicationsCategoryScreen.propTypes = {
  t: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool,
};

ApplicationsCategoryScreen.defaultProps = {
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: !!state.auth.token,
});

export default withTranslation('common__new')(connect(mapStateToProps)(ApplicationsCategoryScreen));
