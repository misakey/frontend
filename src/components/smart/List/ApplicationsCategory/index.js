import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';
import { denormalize } from 'normalizr';

import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import { fetchApplicationsByCategory } from '@misakey/helpers/builder/applications';

import Card from 'components/dumb/Card';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import ApplicationsList from 'components/dumb/List/Applications';
import Title from 'components/dumb/Typography/Title';

import routes from 'routes';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import propOr from '@misakey/helpers/propOr';

import { receiveApplicationsByCategories } from 'store/actions/applications/ByCategory';
import ApplicationsByCategorySchema from 'store/schemas/ApplicationsByCategory';
import ApplicationSchema from 'store/schemas/Application';

// HELPERS
const propOrNull = propOr(null);

const ApplicationsCategory = ({ applicationsList, category, dispatch, isAuthenticated, t }) => {
  const shouldFetch = useMemo(() => isNil(applicationsList), [applicationsList]);

  const fetchApplicationsList = useCallback(
    () => fetchApplicationsByCategory(category, { limit: 5 }, isAuthenticated)
      .then((response) => {
        dispatch(receiveApplicationsByCategories({
          identifier: category,
          applications: response.map(objectToCamelCase),
        }));
      }), [category, isAuthenticated, dispatch],
  );

  const { isFetching, error } = useFetchEffect(
    fetchApplicationsList,
    { shouldFetch },
  );

  return (
    <>
      <Title>
        {t(`common:application.category.${category}`)}
      </Title>
      <Card
        dense
        secondary={{
          to: generatePath(routes.citizen.applications.category, { category }),
          component: Link,
          standing: BUTTON_STANDINGS.TEXT,
          text: t('common:more'),
        }}
      >
        <ApplicationsList
          isFetching={isFetching}
          error={error}
          toRoute={null}
          applications={applicationsList || []}
        />
      </Card>
    </>
  );
};

ApplicationsCategory.propTypes = {
  t: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  applicationsList: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  isAuthenticated: PropTypes.bool,
};

ApplicationsCategory.defaultProps = {
  isAuthenticated: false,
  applicationsList: [],
};

// CONNECT
const mapStateToProps = (state, ownProps) => {
  const { category } = ownProps;
  const denormalized = denormalize(
    category,
    ApplicationsByCategorySchema.entity,
    state.entities,
  );
  return {
    isAuthenticated: state.auth.isAuthenticated,
    applicationsList: propOrNull('applications', denormalized),
  };
};

export default withTranslation('common')(connect(mapStateToProps)(ApplicationsCategory));
