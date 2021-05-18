import React, { useMemo, useRef, useEffect } from 'react';

import PropTypes from 'prop-types';

import { TO_PROP_TYPE } from '@misakey/ui/constants/propTypes';

import isSameHost from '@misakey/core/helpers/isSameHost';
import isSamePage from '@misakey/core/helpers/isSamePage';
import isObject from '@misakey/core/helpers/isObject';
import parseUrlFromLocation from '@misakey/core/helpers/parseUrl/fromLocation';
import locationToString from '@misakey/core/helpers/locationToString';

import { Redirect as RouterRedirect } from 'react-router-dom';

// COMPONENTS
function Redirect({ forceRefresh, to, manualRedirectPlaceholder, ...props }) {
  const isRedirecting = useRef(false);

  const stringTo = useMemo(
    () => (isObject(to)
      ? locationToString(to)
      : to),
    [to],
  );

  const { href } = useMemo(
    () => parseUrlFromLocation(stringTo),
    [stringTo],
  );

  const isHrefSamePage = useMemo(
    () => isSamePage(href),
    [href],
  );

  const isHrefSameHost = useMemo(
    () => isSameHost(href),
    [href],
  );

  const shouldReload = useMemo(
    () => forceRefresh && isHrefSamePage,
    [forceRefresh, isHrefSamePage],
  );

  // always check after shouldReload
  const shouldReplace = useMemo(
    () => !isHrefSameHost || forceRefresh,
    [forceRefresh, isHrefSameHost],
  );

  useEffect(
    () => {
      if (isRedirecting.current === true) {
        return;
      }
      isRedirecting.current = true;
      if (shouldReload) {
        window.location.reload();
      }
      if (shouldReplace) {
        window.location.replace(href);
      }
    },
    [href, shouldReload, shouldReplace],
  );

  if (shouldReload || shouldReplace) {
    return manualRedirectPlaceholder;
  }

  return <RouterRedirect {...props} to={to} />;
}

Redirect.propTypes = {
  forceRefresh: PropTypes.bool,
  to: TO_PROP_TYPE.isRequired,
  manualRedirectPlaceholder: PropTypes.object,
  ...RouterRedirect.propTypes,
};

Redirect.defaultProps = {
  forceRefresh: false,
  manualRedirectPlaceholder: null,
};

export default Redirect;
