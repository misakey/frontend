import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

import {
  SIDES,
  SIDE_QUERY_PARAM,
  TMP_DRAWER_QUERY_PARAMS,
} from '@misakey/ui/constants/drawers';

import getNextSearch from '@misakey/core/helpers/getNextSearch';
import isNil from '@misakey/core/helpers/isNil';

import { useTranslation } from 'react-i18next';

import IconButton from '@misakey/ui/IconButton';

// COMPONENTS
const IconButtonDrawerTemporary = ({ searchKey, side, children, ...props }) => {
  const { t } = useTranslation('common');
  const { pathname, search, hash } = useLocation();

  const nextSearch = useMemo(
    () => (isNil(side)
      ? getNextSearch(search, new Map([[TMP_DRAWER_QUERY_PARAMS, searchKey]]))
      : getNextSearch(search, new Map([
        [TMP_DRAWER_QUERY_PARAMS, searchKey],
        [SIDE_QUERY_PARAM, side],
      ]))),
    [search, searchKey, side],
  );

  const drawerTo = useMemo(
    () => ({
      pathname,
      hash,
      search: nextSearch,
    }),
    [hash, nextSearch, pathname],
  );

  return (
    <IconButton
      aria-label={t('common:open')}
      edge="start"
      component={Link}
      to={drawerTo}
      {...props}
    >
      {children}
    </IconButton>
  );
};

IconButtonDrawerTemporary.propTypes = {
  searchKey: PropTypes.string.isRequired,
  side: PropTypes.oneOf(Object.values(SIDES)),
  children: PropTypes.node,
};

IconButtonDrawerTemporary.defaultProps = {
  side: null,
  children: null,
};

export default IconButtonDrawerTemporary;
