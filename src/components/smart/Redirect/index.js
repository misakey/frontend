import React from 'react';
import PropTypes from 'prop-types';
import { Redirect as RouterRedirect } from 'react-router-dom';
import isSameHost from '@misakey/helpers/isSameHost';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';

// HELPERS
const isSamePage = href => window.location.href === href;

/**
 * @FIXME add to @misakey/ui
 * @param props
 * @returns {void|*}
 * @constructor
 */
function Redirect(props) {
  const { forceRefresh, to } = props;
  const { href, search, pathname } = parseUrlFromLocation(to);

  if (forceRefresh && isSamePage(href)) {
    return window.location.reload();
  }

  if (!isSameHost(href)) {
    return window.location.replace(href);
  }

  return <RouterRedirect {...props} to={`${pathname}${search}`} />;
}

Redirect.propTypes = {
  forceRefresh: PropTypes.bool,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  ...RouterRedirect.propTypes,
};

Redirect.defaultProps = {
  forceRefresh: false,
};

export default Redirect;
