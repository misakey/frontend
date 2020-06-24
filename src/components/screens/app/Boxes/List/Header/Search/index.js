import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import AppBarDrawer, { SIDES } from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';

import getNextSearch from '@misakey/helpers/getNextSearch';
import isEmpty from '@misakey/helpers/isEmpty';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';

import { makeStyles } from '@material-ui/core/styles';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import ArrowBack from '@material-ui/icons/ArrowBack';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles((theme) => ({
  appBar: {
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
}));

const SEARCH = 'search';

function SearchHeader({ drawerWidth, t }) {
  const classes = useStyles();

  const { search: locationSearch, pathname } = useLocation();
  const { replace } = useHistory();
  const locationSearchParams = useLocationSearchParams();

  const { search = '' } = locationSearchParams;

  const clearedSearchTo = useMemo(
    () => ({ pathname, search: getNextSearch(locationSearch, new Map([['search', '']])) }),
    [pathname, locationSearch],
  );
  const goBack = useMemo(
    () => ({ pathname, search: getNextSearch(locationSearch, new Map([['search', undefined]])) }),
    [locationSearch, pathname],
  );

  const updateRouter = useCallback(
    (value) => {
      const nextSearch = getNextSearch(locationSearch, new Map([
        [SEARCH, value],
      ]));
      replace({ search: nextSearch });
    },
    [locationSearch, replace],
  );

  const onChange = useCallback(
    (event) => {
      const nextSearch = event.target.value;
      updateRouter(nextSearch);
    },
    [updateRouter],
  );

  const startAdornment = useMemo(
    () => (
      <InputAdornment
        position="start"
      >
        <IconButtonAppBar
          color="inherit"
          aria-label={t('common:goBack')}
          edge="start"
          component={Link}
          to={goBack}
        >
          <ArrowBack />
        </IconButtonAppBar>
      </InputAdornment>
    ),
    [goBack, t],
  );

  const isEmptySearch = useMemo(
    () => isEmpty(search),
    [search],
  );

  const endAdornment = useMemo(
    () => {
      const endAdornmentProps = isEmptySearch
        ? {}
        : {
          component: Link,
          replace: true,
          to: clearedSearchTo,
        };
      return (
        <InputAdornment position="end">
          <IconButton
            edge="end"
            color="inherit"
            aria-label={t('common:search')}
            {...endAdornmentProps}
          >
            {isEmptySearch ? <SearchIcon /> : <ClearIcon />}
          </IconButton>
        </InputAdornment>
      );
    },
    [isEmptySearch, clearedSearchTo, t],
  );

  return (
    <AppBarDrawer side={SIDES.LEFT} drawerWidth={drawerWidth} classes={{ root: classes.appBar }}>
      <TextField
        autoFocus
        fullWidth
        placeholder={t('search')}
        onChange={onChange}
        value={search}
        InputProps={{
          startAdornment, endAdornment, disableUnderline: true,
        }}
      />
    </AppBarDrawer>
  );
}

SearchHeader.propTypes = {
  // DRAWER
  drawerWidth: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('common')(SearchHeader);
