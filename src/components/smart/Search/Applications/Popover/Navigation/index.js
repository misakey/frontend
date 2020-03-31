import React, { useMemo } from 'react';

import { REQUEST } from 'constants/search/application/params';

import prop from '@misakey/helpers/prop';
import getNextSearch from '@misakey/helpers/getNextSearch';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import { useLocation } from 'react-router-dom';
import makeStyles from '@material-ui/core/styles/makeStyles';

import AppBarNavigation from 'components/dumb/AppBar/Navigation';
import SearchApplicationsButton from 'components/smart/Search/Applications/Button';
import Box from '@material-ui/core/Box';

// HELPERS
const getMainDomainSearchParam = prop(REQUEST);

// HOOKS
const useStyles = makeStyles(() => ({
  backButton: {
    position: 'absolute',
  },
}));

// COMPONENTS
const SearchApplicationsPopoverNavigation = (rest) => {
  const classes = useStyles();

  const { pathname, search } = useLocation();
  const locationSearchParams = useLocationSearchParams();

  const homePath = useMemo(
    () => ({
      pathname,
      search: getNextSearch(search, new Map([
        [REQUEST, undefined],
      ])),
    }),
    [pathname, search],
  );

  const mainDomain = useMemo(
    () => getMainDomainSearchParam(locationSearchParams),
    [locationSearchParams],
  );

  return (
    <AppBarNavigation
      homePath={homePath}
      replace
      classes={{ backButton: classes.backButton }}
      {...rest}
    >
      <Box m="auto">
        <SearchApplicationsButton mainDomain={mainDomain} disabled />
      </Box>
    </AppBarNavigation>
  );
};

export default SearchApplicationsPopoverNavigation;
