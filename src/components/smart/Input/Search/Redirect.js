import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withRouter, matchPath } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import { ROLE_LABELS } from 'constants/Roles';
import routes from 'routes';

import useTimeout from '@misakey/hooks/useTimeout';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import isString from '@misakey/helpers/isString';
import prop from '@misakey/helpers/prop';
import propOr from '@misakey/helpers/propOr';
import getSearchParams from '@misakey/helpers/getSearchParams';


import CancelIcon from '@material-ui/icons/Cancel';
import IconButton from '@material-ui/core/IconButton';

import InputSearch from 'components/dumb/Input/Search';

// CONSTANTS
const SEARCH_DELAY = 300;
const ROLE_REGEX = new RegExp(`^/(${Object.values(ROLE_LABELS).join('|')})`);


// HELPERS
const searchProp = prop('search');

// HOOKS
const useStyles = makeStyles((theme) => ({
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputSearch: {
    transition: theme.transitions.create('width'),
    width: '200px',
  },
  inputSearchOverlay: {
    width: '100%',
  },
}));

const useOnSearchChange = (setValue) => useCallback(
  ({ target: { value } }) => {
    setValue(value);
  },
  [setValue],
);

const useOnReset = (setValue, searchParams, history) => useCallback(
  () => {
    setValue('');
    const nextSearch = new URLSearchParams(searchParams);
    nextSearch.delete('search');
    history.replace({
      search: nextSearch.toString(),
    });
  },
  [setValue, searchParams, history],
);

const useOnExternalRedirect = (search, isSearchActive, setValue, isOverlay, inputRef) => useEffect(
  () => {
    const { current } = inputRef;
    const isFocused = !isNil(current) ? document.activeElement === current : false;
    if (isOverlay && !isFocused && isSearchActive) {
      setValue(search);
    }
  },
  [search, isSearchActive, setValue, isOverlay, inputRef],
);

const useOnRedirect = (search, value, searchParams, history) => useCallback(
  () => {
    const searchQuery = isEmpty(value) ? '' : value;
    if (isString(search) && value !== search) {
      const query = new URLSearchParams(searchParams);
      query.set('search', searchQuery);

      history.replace({
        search: query.toString(),
      });
    }
  },
  [search, value, searchParams, history],
);


const useOnActive = (
  searchParams,
  history,
  isOverlay,
  isSearchActive,
  locationPrefix,
  setValue,
  inputRef,
) => useCallback(
  () => {
    // @FIXME quick fix, maybe won't work all the time, not so clean anyway
    // clear search value when activating from out of overlay
    if (!isOverlay) {
      setValue('');
    }

    const pathname = locationPrefix === ROLE_LABELS.ADMIN
      ? routes.admin.applications
      : routes.citizen.applications;

    if (!isOverlay || !isSearchActive) {
      const nextSearch = new URLSearchParams(searchParams);
      nextSearch.set('search', '');
      history.push({
        pathname,
        search: nextSearch.toString(),
      });
    }

    if (!isNil(inputRef.current)) {
      inputRef.current.focus();
    }
  },
  [searchParams, history, isOverlay, isSearchActive, locationPrefix, setValue, inputRef],
);


// COMPONENTS
function InputSearchRedirect({
  delay,
  history,
  location: { search: locationSearch, pathname },
  ...rest
}) {
  const inputRef = useRef();
  const classes = useStyles();

  const searchParams = useMemo(
    () => getSearchParams(locationSearch),
    [locationSearch],
  );

  const search = useMemo(
    () => searchProp(searchParams),
    [locationSearch],
  );

  const [value, setValue] = useState(search || '');

  const isOverlay = useMemo(
    () => matchPath(pathname, routes.citizen.applications) !== null
      || matchPath(pathname, routes.admin.applications) !== null,
    [pathname],
  );

  const isSearchActive = useMemo(
    () => !isNil(search),
    [search],
  );
  const hasSearch = useMemo(
    () => !isEmpty(value),
    [value],
  );

  const locationPrefix = useMemo(
    () => propOr('', '1', ROLE_REGEX.exec(pathname)),
    [pathname],
  );

  const onSearchChange = useOnSearchChange(setValue);
  const onReset = useOnReset(setValue, searchParams, history);
  const onActive = useOnActive(
    searchParams,
    history,
    isOverlay,
    isSearchActive,
    locationPrefix,
    setValue,
    inputRef,
  );

  useOnExternalRedirect(search, isSearchActive, setValue, isOverlay, inputRef);
  const onRedirect = useOnRedirect(search, value, searchParams, history);

  const immediateRun = useMemo(
    () => (isSearchActive && !hasSearch) // search is cleared but routeSearch was not empty
      || (!isSearchActive && !hasSearch), // search and routeSearch are empty
    [isSearchActive, hasSearch],
  );

  useTimeout(
    onRedirect,
    { delay, immediateRun },
    value,
    hasSearch,
    isSearchActive,
  );

  return (
    <div className={clsx(classes.inputSearch, { [classes.inputSearchOverlay]: isOverlay })}>
      <InputSearch
        ref={inputRef}
        value={isOverlay ? value : ''}
        readOnly={!isOverlay}
        onChange={onSearchChange}
        onFocus={onActive}
        {...rest}
      >
        {hasSearch && isOverlay && (
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
    </div>
  );
}

InputSearchRedirect.propTypes = {
  history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string, search: PropTypes.string }).isRequired,
  delay: PropTypes.number,
};

InputSearchRedirect.defaultProps = {
  delay: SEARCH_DELAY,
};


export default withRouter(InputSearchRedirect);
