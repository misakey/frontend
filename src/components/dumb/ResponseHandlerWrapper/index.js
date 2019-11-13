import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from '@misakey/helpers/isEmpty';
import isNumber from '@misakey/helpers/isNumber';
import isString from '@misakey/helpers/isString';
import ErrorOverlay from 'components/dumb/Error/Overlay';
import SplashScreen from 'components/dumb/SplashScreen';

/**
 * @param children
 * @param entity
 * @param error
 * @param isFetching
 * @returns {*}
 * @constructor
 */
function ResponseHandlerWrapper({ children, entity, error, isFetching }) {
  if (isString(error) || isNumber(error)) { return <ErrorOverlay httpStatus={error} />; }
  if (isFetching && isEmpty(entity)) { return <SplashScreen />; }
  if (isEmpty(entity)) { return <ErrorOverlay httpStatus={404} />; }

  return children;
}

ResponseHandlerWrapper.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]).isRequired,
  entity: PropTypes.object,
  error: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.bool]),
  isFetching: PropTypes.bool,
};

ResponseHandlerWrapper.defaultProps = {
  entity: {},
  error: {},
  isFetching: {},
};

export default ResponseHandlerWrapper;
