import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import log from '@misakey/helpers/log';
import { fetchApplicationsByCategory } from 'helpers/fetchApplications';

import Container from '@material-ui/core/Container';
import Navigation from 'components/dumb/Navigation';


import ApplicationsList from 'components/dumb/List/Applications';
import Screen from 'components/dumb/Screen';


const ApplicationsCategoryScreen = ({ isAuthenticated, t, match, history }) => {
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
      <Navigation
        history={history}
        toolbarProps={{ maxWidth: 'md' }}
        title={t(`application.category.${category}`)}
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
  history: PropTypes.object.isRequired,
};

ApplicationsCategoryScreen.defaultProps = {
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: !!state.auth.token,
});

export default withTranslation('common')(connect(mapStateToProps)(ApplicationsCategoryScreen));
