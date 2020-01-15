import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { withTranslation } from 'react-i18next';
import { Link, useLocation, useHistory } from 'react-router-dom';

import API from '@misakey/api';

import { SEARCH_WIDTH_LG, SEARCH_WIDTH_MD } from 'constants/ui/sizes';

import { applicationsOnFetch } from 'store/actions/screens/applications';
import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import debounce from '@misakey/helpers/debounce';
import eventPreventDefault from '@misakey/helpers/event/preventDefault';
import getNextSearch from 'helpers/getNextSearch';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import useLocationSearchParams from 'hooks/useLocationSearchParams';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import CircularProgress from '@material-ui/core/CircularProgress';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import Option from 'components/smart/Search/Applications/Popover/Option';
import IconButton from '@material-ui/core/IconButton';

import ClearIcon from '@material-ui/icons/Clear';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SearchIcon from '@material-ui/icons/Search';

const ANCHOR_ORIGIN = {
  vertical: 'top',
  horizontal: 'center',
};

const TRANSFORM_ORIGIN = {
  vertical: 'top',
  horizontal: 'center',
};

// HELPERS
const getApplications = (search, isAuthenticated) => {
  const endpoint = API.endpoints.application.find;

  if (isAuthenticated) { endpoint.auth = true; }

  return API.use(endpoint)
    .build(undefined, undefined, { search, heavier_than: 99, published: true, limit: 10 })
    .send();
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  paper: {
    [theme.breakpoints.down('xs')]: {
      maxWidth: '100%',
      maxHeight: '100%',
      width: '100%',
      height: '100%',
    },
    [theme.breakpoints.up('sm')]: {
      minWidth: SEARCH_WIDTH_MD,
      width: '60%',
    },
    [theme.breakpoints.up('md')]: {
      width: SEARCH_WIDTH_MD,
    },
    [theme.breakpoints.up('lg')]: {
      width: SEARCH_WIDTH_LG,
    },
  },
  inputLabelShrink: {
    transform: 'translate(12px, 4px) scale(0.75) !important',
  },
}));

// COMPONENTS
const SearchApplicationsPopover = ({
  id,
  anchorEl,
  onClose,
  entities,
  isAuthenticated,
  dispatchReceive,
  t,
}) => {
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isFull = useMediaQuery(theme.breakpoints.down('xs'));

  const classes = useStyles();

  const { search: locationSearch, pathname } = useLocation();
  const { replace } = useHistory();
  const { search } = useLocationSearchParams();
  const searchValue = useMemo(
    () => search || '',
    [search],
  );

  const clearedSearchTo = useMemo(
    () => ({ pathname, search: getNextSearch(locationSearch, new Map([['search', '']])) }),
    [pathname, locationSearch],
  );

  const popoverProps = useMemo(
    () => (isFull
      ? {
        marginThreshold: 0,
        anchorReference: 'anchorPosition',
        anchorPosition: { left: 0, top: 0 },
      }
      : {
        anchorReference: 'anchorEl',
        anchorEl,
      }),
    [anchorEl, isFull],
  );

  const open = useMemo(
    () => !isNil(anchorEl),
    [anchorEl],
  );

  const listLoading = useMemo(
    () => loading || isNil(entities),
    [loading, entities],
  );

  const options = useMemo(
    () => (entities || []).concat([{ mainDomain: null }]),
    [entities],
  );

  const updateRouter = useCallback(
    (value) => {
      const nextSearch = getNextSearch(locationSearch, new Map([['search', value]]));
      replace({ search: nextSearch });
    },
    [locationSearch, replace],
  );

  const onSearchClose = useCallback(
    () => {
      updateRouter(undefined);
      onClose();
    },
    [updateRouter, onClose],
  );

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

  const onGetOptions = useMemo(
    () => debounce((nextSearch, isAuth) => {
      if (!isNil(nextSearch)) {
        setLoading(true);
        getApplications(nextSearch, isAuth)
          .then((response) => {
            dispatchReceive(response.map(objectToCamelCase));
          })
          .finally(() => { setLoading(false); });
      }
    }, 200),
    [dispatchReceive, setLoading],
  );

  const onChange = useCallback((event) => {
    const nextSearch = event.target.value;
    updateRouter(nextSearch);
  },
  [updateRouter]);

  // update options anytime search or isAuthenticated change
  useEffect(
    () => {
      onGetOptions(search, isAuthenticated);
    },
    [isAuthenticated, onGetOptions, search],
  );

  // update router when popover opens
  useEffect(
    () => {
      if (isNil(search) && open) {
        updateRouter(searchValue);
      }
    },
    [open, search, searchValue, updateRouter],
  );

  return (
    <Popover
      id={id}
      open={open}
      onClose={onSearchClose}
      anchorOrigin={ANCHOR_ORIGIN}
      transformOrigin={TRANSFORM_ORIGIN}
      marginThreshold={0}
      classes={{ paper: classes.paper }}
      {...popoverProps}
    >
      <Box>
        <Box mx={1.5} my={1}>
          <TextField
            autoFocus
            fullWidth
            placeholder={t('common:search')}
            onChange={onChange}
            value={searchValue}
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
        <List disablePadding>
          {options.map((option) => (
            <Option
              key={option.mainDomain}
              application={option}
              disabled={listLoading}
              onClick={onClose}
            />
          ))}
        </List>
      </Box>
    </Popover>
  );
};

SearchApplicationsPopover.propTypes = {
  id: PropTypes.string,
  anchorEl: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  onClose: PropTypes.func.isRequired,
  // CONNECT
  entities: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  isAuthenticated: PropTypes.bool,
  dispatchReceive: PropTypes.func.isRequired,

  t: PropTypes.func.isRequired,
};

SearchApplicationsPopover.defaultProps = {
  id: null,
  anchorEl: null,
  entities: null,
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  entities: denormalize(
    state.screens.applications.ids,
    ApplicationSchema.collection,
    state.entities,
  ),
  isAuthenticated: !!state.auth.token,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchReceive: (applications) => dispatch(applicationsOnFetch(applications)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation('common')(SearchApplicationsPopover));
