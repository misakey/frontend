import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { SIDES, SIDE_QUERY_PARAM, TMP_DRAWER_QUERY_PARAMS, TMP_DRAWER_ORG_VALUE } from '@misakey/ui/constants/drawers';

import getNextSearch from '@misakey/helpers/getNextSearch';
import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import IconButton from '@misakey/ui/IconButton';

import MenuIcon from '@material-ui/icons/Menu';

// COMPONENTS
function ButtonDrawerOrganization({ t, side, ...props }) {
  const { pathname, search, hash } = useLocation();

  const nextSearch = useMemo(
    () => (isNil(side)
      ? getNextSearch(search, new Map([[TMP_DRAWER_QUERY_PARAMS, TMP_DRAWER_ORG_VALUE]]))
      : getNextSearch(search, new Map([
        [TMP_DRAWER_QUERY_PARAMS, TMP_DRAWER_ORG_VALUE],
        [SIDE_QUERY_PARAM, side],
      ]))),
    [search, side],
  );

  const openOrganizationDrawer = useMemo(
    () => ({
      pathname,
      hash,
      search: nextSearch,
    }),
    [hash, pathname, nextSearch],
  );

  return (
    <IconButton
      color="background"
      aria-label={t('common:open')}
      component={Link}
      to={openOrganizationDrawer}
      edge="start"
      {...omitTranslationProps(props)}
    >
      <MenuIcon />
    </IconButton>
  );
}

ButtonDrawerOrganization.propTypes = {
  side: PropTypes.oneOf(Object.values(SIDES)),
  // withTranslation
  t: PropTypes.func.isRequired,
};

ButtonDrawerOrganization.defaultProps = {
  side: null,
};

export default withTranslation(['common'])(ButtonDrawerOrganization);
