import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, useLocation, useParams, generatePath } from 'react-router-dom';
import { useFormikContext } from 'formik';

import isString from '@misakey/helpers/isString';
import getSearchParams from '@misakey/helpers/getSearchParams';
import getNextSearch from '@misakey/helpers/getNextSearch';
import toPairs from '@misakey/helpers/toPairs';
import whereEq from '@misakey/helpers/whereEq';

// COMPONENTS
const RouteFormik = ({ route: RouteComponent, start, path, ...rest }) => {
  const { search } = useLocation();
  const params = useParams();

  const locationSearchParams = useMemo(
    () => getSearchParams(search),
    [search],
  );

  const { dirty } = useFormikContext();

  const isStringStart = useMemo(
    () => isString(start),
    [start],
  );

  const isStart = useMemo(
    () => {
      if (isStringStart) {
        return path === start;
      }
      return start.path === path && whereEq(start.searchParams, locationSearchParams);
    },
    [isStringStart, start, path, locationSearchParams],
  );

  const redirectTo = useMemo(
    () => (isStringStart ? {
      pathname: generatePath(start, params),
      search,
    } : {
      pathname: generatePath(start.path, params),
      search: getNextSearch(search, new Map(toPairs(start.searchParams))),
    }),
    [isStringStart, params, search, start],
  );

  if (!dirty && !isStart) {
    return <Redirect to={redirectTo} />;
  }
  return <RouteComponent path={path} {...rest} />;
};

RouteFormik.propTypes = {
  route: PropTypes.elementType,
  start: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      path: PropTypes.string,
      searchParams: PropTypes.objectOf(PropTypes.string),
    }),
  ]).isRequired,
  // ROUTE
  path: PropTypes.string.isRequired,
};

RouteFormik.defaultProps = {
  route: Route,
};

export default RouteFormik;
