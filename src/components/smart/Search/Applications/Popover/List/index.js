import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { SUGGESTED_TYPE, LINKED_TYPE } from 'constants/search/application/type';

import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';
import isArray from '@misakey/helpers/isArray';
import isObject from '@misakey/helpers/isObject';
import isEmpty from '@misakey/helpers/isEmpty';
import eventPreventDefault from '@misakey/helpers/event/preventDefault';
import getNextSearch from '@misakey/helpers/getNextSearch';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import IconButton from '@material-ui/core/IconButton';
import ApplicationListItemNotFound from 'components/dumb/ListItem/Application/NotFound';
import Option from 'components/smart/Search/Applications/Popover/List/Option';
import PopoverListSubheader from 'components/smart/Search/Applications/Popover/List/ListSubheader';

import ClearIcon from '@material-ui/icons/Clear';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SearchIcon from '@material-ui/icons/Search';

// HOOKS
const useStyles = makeStyles((theme) => ({
  inputLabelShrink: {
    transform: 'translate(12px, 4px) scale(0.75) !important',
  },
  searchBoxRoot: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    backgroundColor: theme.palette.background.paper,
  },
  listRoot: {
    backgroundColor: theme.palette.background.paper,
  },
  listSubheaderRoot: {
    top: theme.spacing(6),
    textTransform: 'uppercase',
    zIndex: 2,
  },
}));

// added this because there were weird errors with list containing undefined values
const useCleanList = (list) => useMemo(
  () => (isArray(list) ? list.filter(isObject) : []),
  [list],
);

// COMPONENTS
const SearchApplicationsPopoverList = ({
  onClose,
  onSelect,
  onSearchClose,
  updateRouter,
  suggested,
  linked,
  loading,
  search,
  t,
}) => {
  const classes = useStyles();

  const { search: locationSearch, pathname } = useLocation();

  const clearedSearchTo = useMemo(
    () => ({ pathname, search: getNextSearch(locationSearch, new Map([['search', '']])) }),
    [pathname, locationSearch],
  );

  const listLoading = useMemo(
    () => loading || isNil(suggested) || isNil(linked),
    [loading, suggested, linked],
  );

  const suggestedOptions = useCleanList(suggested);

  const linkedOptions = useCleanList(linked);

  const startAdornment = useMemo(
    () => (
      <InputAdornment
        position="start"
      >
        <IconButton
          edge="start"
          color="inherit"
          aria-label={t('common:back')}
          onClick={onSearchClose}
        >
          <ArrowBackIcon />
        </IconButton>
      </InputAdornment>
    ),
    [onSearchClose, t],
  );

  const onMouseDown = useCallback(
    (event) => {
      eventPreventDefault(event);
    },
    [],
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
        <InputAdornment
          position="end"
          classes={{ root: classes.inputAdornmentRoot }}
        >
          {loading ? <CircularProgress color="inherit" size={20} /> : (
            <IconButton
              edge="end"
              color="inherit"
              aria-label={t('common:search')}
              onMouseDown={onMouseDown}
              {...endAdornmentProps}
            >
              {isEmptySearch ? <SearchIcon /> : <ClearIcon />}
            </IconButton>
          )}
        </InputAdornment>
      );
    },
    [isEmptySearch, clearedSearchTo, classes.inputAdornmentRoot, loading, t, onMouseDown],
  );

  const onChange = useCallback((event) => {
    const nextSearch = event.target.value;
    updateRouter(nextSearch);
  },
  [updateRouter]);

  return (
    <Box>
      <Box px={1.5} py={1} classes={{ root: classes.searchBoxRoot }}>
        <TextField
          autoFocus
          fullWidth
          placeholder={t('common:search')}
          onChange={onChange}
          value={search}
          InputProps={{
            startAdornment,
            endAdornment,
            disableUnderline: true,
          }}
          InputLabelProps={{
            classes: { shrink: classes.inputLabelShrink },
            disableAnimation: true,
          }}
        />
      </Box>
      <List disablePadding classes={{ root: classes.listRoot }}>
        {!isEmpty(linkedOptions) && (
          <PopoverListSubheader
            classes={{ root: classes.listSubheaderRoot }}
            type={LINKED_TYPE}
          />
        )}
        {linkedOptions.map((option) => (
          <Option
            key={option.mainDomain}
            application={option}
            disabled={listLoading}
            onClick={onSelect(option.id)}
          />
        ))}
        <PopoverListSubheader
          classes={{ root: classes.listSubheaderRoot }}
          type={SUGGESTED_TYPE}
        />
        {suggestedOptions.map((option) => (
          <Option
            key={option.mainDomain}
            application={option}
            disabled={listLoading}
            onClick={onSelect(option.id)}
          />
        ))}
        <ApplicationListItemNotFound
          disabled={listLoading}
          searchValue={search}
          onClick={onClose}
        />
      </List>
    </Box>
  );
};

SearchApplicationsPopoverList.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func,
  onSearchClose: PropTypes.func.isRequired,
  updateRouter: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  search: PropTypes.string,
  // CONNECT
  suggested: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  linked: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),

  t: PropTypes.func.isRequired,
};

SearchApplicationsPopoverList.defaultProps = {
  suggested: null,
  linked: null,
  onSelect: null,
  loading: false,
  search: '',
};

export default withTranslation('common')(SearchApplicationsPopoverList);
