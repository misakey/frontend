import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

import { SIDES, SIDE_QUERY_PARAM, TMP_DRAWER_QUERY_PARAMS, TMP_DRAWER_ACCOUNT_VALUE } from '@misakey/ui/constants/drawers';

import getNextSearch from '@misakey/core/helpers/getNextSearch';
import isNil from '@misakey/core/helpers/isNil';

import IconButtonAccount from 'components/smart/IconButton/Account';

// COMPONENTS
// @UNUSED @DEPRECATED
function IconButtonDrawerAccount({ side, ...props }) {
  const { pathname, search, hash } = useLocation();

  const nextSearch = useMemo(
    () => (isNil(side)
      ? getNextSearch(search, new Map([[TMP_DRAWER_QUERY_PARAMS, TMP_DRAWER_ACCOUNT_VALUE]]))
      : getNextSearch(search, new Map([
        [TMP_DRAWER_QUERY_PARAMS, TMP_DRAWER_ACCOUNT_VALUE],
        [SIDE_QUERY_PARAM, side],
      ]))),
    [search, side],
  );

  const openAccount = useMemo(
    () => ({
      pathname,
      hash,
      search: nextSearch,
    }),
    [hash, pathname, nextSearch],
  );

  return (
    <IconButtonAccount
      component={Link}
      to={openAccount}
      {...props}
    />
  );
}

IconButtonDrawerAccount.propTypes = {
  side: PropTypes.oneOf(Object.values(SIDES)),
};

IconButtonDrawerAccount.defaultProps = {
  side: null,
};

export default IconButtonDrawerAccount;
