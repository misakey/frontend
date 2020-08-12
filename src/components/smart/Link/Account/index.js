import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import routes from 'routes';

import { Link, generatePath, useLocation, useRouteMatch } from 'react-router-dom';
import getNextSearch from '@misakey/helpers/getNextSearch';
import { ACCOUNT_LEFT_DRAWER_QUERY_PARAM, TMP_DRAWER_QUERY_PARAMS, LEFT_DRAWER_QUERY_PARAM } from 'packages/ui/src/constants/drawers';
import { TAB_VALUES } from 'components/dumb/Tabs/DrawerMenu';

// COMPONENTS
const AccountLink = forwardRef(({ id, ...props }, ref) => {
  const { search } = useLocation();
  const isOnDocumentWorkspace = useRouteMatch(routes.documents._);
  const nextSearch = useMemo(
    () => (isOnDocumentWorkspace ? TAB_VALUES.DOCUMENT : TAB_VALUES.CHAT),
    [isOnDocumentWorkspace],
  );

  const to = useMemo(
    () => ({
      pathname: generatePath(routes.accounts._, { id }),
      search: getNextSearch(
        search,
        new Map([
          [ACCOUNT_LEFT_DRAWER_QUERY_PARAM, nextSearch],
          [LEFT_DRAWER_QUERY_PARAM, undefined],
          [TMP_DRAWER_QUERY_PARAMS, undefined],
        ]),
      ),
    }),
    [id, nextSearch, search],
  );

  return (
    <Link ref={ref} to={to} {...props} />
  );
});

AccountLink.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

AccountLink.defaultProps = {
  id: null,
};

export default AccountLink;
