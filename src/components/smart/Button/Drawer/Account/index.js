import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { SIDES, SIDE_QUERY_PARAM, TMP_DRAWER_QUERY_PARAMS, TMP_DRAWER_ACCOUNT_VALUE } from '@misakey/ui/constants/drawers';

import getNextSearch from '@misakey/helpers/getNextSearch';
import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import UserAccountAvatar from 'components/smart/Avatar/CurrentUser';


// COMPONENTS
function ButtonDrawerAccount({ t, side, ...props }) {
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

  const openAccountDrawer = useMemo(
    () => ({
      pathname,
      hash,
      search: nextSearch,
    }),
    [hash, pathname, nextSearch],
  );

  return (
    <IconButtonAppBar
      aria-label={t('common:openAccountDrawer')}
      component={Link}
      to={openAccountDrawer}
      edge="start"
      {...omitTranslationProps(props)}
    >
      <UserAccountAvatar />
    </IconButtonAppBar>
  );
}

ButtonDrawerAccount.propTypes = {
  side: PropTypes.oneOf(Object.values(SIDES)),
  // withTranslation
  t: PropTypes.func.isRequired,
};

ButtonDrawerAccount.defaultProps = {
  side: null,
};

export default withTranslation(['common'])(ButtonDrawerAccount);
