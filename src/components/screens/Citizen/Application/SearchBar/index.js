import React, { useState, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import CancelIcon from '@material-ui/icons/Cancel';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import API from '@misakey/api';
import {
  applicationsOnFetch,
  screenApplicationsBoxesAdd,
} from 'store/actions/screens/applications';

import useTimeout from '@misakey/hooks/useTimeout';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import isString from '@misakey/helpers/isString';
import getSearchParams from '@misakey/helpers/getSearchParams';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import InputSearch from 'components/dumb/Input/Search';

// CONSTANTS
const SEARCH_DELAY = 1000;

// HELPERS
const getOnSearchChange = (setSearch) => ({ target: { value } }) => {
  setSearch(value);
};
const getOnReset = (setSearch, inputRef) => ({ noFocus }) => {
  setSearch('');
  if (!isNil(inputRef.current) && noFocus !== true) {
    inputRef.current.focus();
  }
};
const getOnQuery = (getData, search, history, location) => () => {
  const isLengthValid = search.length >= 3 || search.length === 0;

  if (isString(search) && isLengthValid) {
    getData(search);
  }

  const searchQuery = isEmpty(search) ? '' : search;
  const query = `?search=${searchQuery}`;
  const searchParam = getSearchParams(location.search).search;
  if (isString(searchParam) && searchParam !== searchQuery) {
    history.replace(`${location.pathname}${query}`);
  }
};

const getIsSearchActive = (search) => !isNil(search);
const getHasSearch = (search) => getIsSearchActive(search) && search.length > 0;
const getIcon = (isActive) => (isActive ? ArrowBackIcon : SearchIcon);

const formatData = (response) => response.map((o) => objectToCamelCase(o));

// HOOKS
const useOnSearchChange = (setSearch) => useMemo(() => getOnSearchChange(setSearch), [setSearch]);
const useOnReset = (setSearch, inputRef) => useMemo(
  () => getOnReset(setSearch, inputRef), [setSearch, inputRef],
);
const useOnQuery = (getData, search, history, location) => useMemo(
  () => getOnQuery(getData, search, history, location), [getData, search, history, location],
);
const useStyles = makeStyles(() => ({
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const useOnActive = (onFocus, history, isSearchActive, inputRef) => useMemo(() => (event) => {
  if (!isSearchActive) {
    history.replace({
      search: '?search=',
    });
  }

  onFocus(event);
  if (!isNil(inputRef.current)) {
    inputRef.current.focus();
  }
}, [onFocus, history, isSearchActive, inputRef]);
const useOnInactive = (onBlur, onReset, history) => useMemo(() => (event) => {
  history.replace({
    search: '',
  });
  onReset({ noFocus: true });
  onBlur(event);
}, [onBlur, onReset, history]);
const useIcon = (hasSearch) => useMemo(() => getIcon(hasSearch), [hasSearch]);

const useIsSearchActive = (search) => useMemo(() => getIsSearchActive(search), [search]);
const useHasSearch = (search) => useMemo(() => getHasSearch(search), [search]);

// COMPONENTS
function ApplicationSearchBar({
  dispatch, history, location, onFetching, onFocus, onBlur, isAuthenticated, t, ...rest
}) {
  const inputRef = useRef();
  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();
  const searchParam = getSearchParams(location.search).search;

  const [search, setSearch] = useState(searchParam || '');
  const [isFetching, setFetching] = useState(false);
  const isSearchActive = useIsSearchActive(searchParam);
  const hasSearch = useHasSearch(search);

  const Icon = useIcon(isSearchActive);

  const onSearchChange = useOnSearchChange(setSearch);
  const onReset = useOnReset(setSearch, inputRef);
  const onActive = useOnActive(onFocus, history, isSearchActive, inputRef);
  const onInactive = useOnInactive(onBlur, onReset, history);

  const getData = (s = search) => {
    if (!isFetching) {
      setFetching(true);

      let promise;

      const endpoint = API.endpoints.application.find;

      if (!isAuthenticated) { endpoint.auth = false; }

      if (isAuthenticated && isNil(searchParam)) {
        promise = API.use(API.endpoints.application.box.find).build().send()
          .then((response) => {
            const ids = response.map((databoxInfo) => databoxInfo.producer_id);
            dispatch(screenApplicationsBoxesAdd(ids));
            return API.use(endpoint)
              .build(undefined, undefined, { ids: ids.join(',') })
              .send();
          });
      } else {
        promise = API.use(endpoint)
          .build(undefined, undefined, { search: s })
          .send();
      }

      promise
        .then((response) => {
          dispatch(applicationsOnFetch(formatData(response)));
          setFetching(false);
        })
        .catch((e) => {
          setFetching(false);

          const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
          enqueueSnackbar(text, { variant: 'error' });
        });
    }
  };

  const onQuery = useOnQuery(getData, search, history, location);
  useTimeout(
    onQuery,
    { delay: SEARCH_DELAY, immediateRun: !isSearchActive || !hasSearch },
    search,
    isSearchActive,
    isAuthenticated,
  );

  useEffect(() => { onFetching(isFetching); }, [isFetching, onFetching]);
  useEffect(getData, [isAuthenticated]);

  return (
    <InputSearch
      ref={inputRef}
      {...rest}
      autoFocus={isSearchActive}
      value={search}
      onChange={onSearchChange}
      onFocus={onActive}
      Icon={Icon}
      onIconClick={isSearchActive ? onInactive : onActive}
    >
      {hasSearch && (
        <IconButton
          className={classes.clearButton}
          aria-label="Clear"
          type="reset"
          onClick={onReset}
        >
          <CancelIcon />
        </IconButton>
      )}
    </InputSearch>
  );
}

ApplicationSearchBar.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string, search: PropTypes.string }).isRequired,
  onFetching: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: !!state.auth.token,
});

export default connect(mapStateToProps)(
  withRouter(withTranslation()(ApplicationSearchBar)),
);
