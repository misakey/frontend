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
  baseInputRoot: {
    width: ({ isOverlay }) => `${isOverlay ? '' : 0}`,
    pointerEvents: ({ isOverlay }) => `${isOverlay ? '' : 'none'}`,
  },
  inputSearch: {
    transition: theme.transitions.create('width'),
    display: 'flex',
    flexShrink: '1',
    fontSize: theme.typography.subtitle2.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
    lineHeight: theme.typography.subtitle2.lineHeight,
    letterSpacing: theme.typography.subtitle2.letterSpacing,
  },
  inputSearchOverlay: {
    width: '100%',
    [theme.breakpoints.only('xs')]: {
      fontSize: theme.typography.subtitle1.fontSize,
      fontWeight: theme.typography.subtitle1.fontWeight,
      lineHeight: theme.typography.subtitle1.lineHeight,
      letterSpacing: theme.typography.subtitle1.letterSpacing,
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: theme.typography.h6.fontSize,
      fontWeight: theme.typography.h6.fontWeight,
      lineHeight: theme.typography.h6.lineHeight,
      letterSpacing: theme.typography.h6.letterSpacing,
    },
  },
}));

const useOnSearchChange = (setValue) => useCallback(
  ({ target: { value } }) => {
    setValue(value);
  },
  [setValue],
);

const useOnReset = (setValue, searchParams, history, onIconClick) => useCallback(
  () => {
    setValue('');
    const nextSearch = new URLSearchParams(searchParams);
    nextSearch.set('search', '');
    history.replace({
      search: nextSearch.toString(),
    });
    onIconClick();
  },
  [setValue, searchParams, history, onIconClick],
);

const useOnExternalRedirect = (search, isSearchActive, setValue, isOverlay, inputRef) => useEffect(
  () => {
    const { current } = inputRef;
    const isFocused = !isNil(current) ? document.activeElement === current : false;
    if (isOverlay && !isFocused && isSearchActive) {
      setValue(search);
      current.focus();
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
  },
  [searchParams, history, isOverlay, isSearchActive, locationPrefix, setValue],
);


// COMPONENTS
function InputSearchRedirect({
  delay,
  history,
  location: { search: locationSearch, pathname },
  ...rest
}) {
  const inputRef = useRef();

  const isOverlay = useMemo(
    () => matchPath(pathname, routes.citizen.applications) !== null
      || matchPath(pathname, routes.admin.applications) !== null,
    [pathname],
  );

  const classes = useStyles({ isOverlay });

  const searchParams = useMemo(
    () => getSearchParams(locationSearch),
    [locationSearch],
  );

  const search = useMemo(
    () => searchProp(searchParams),
    [searchParams],
  );

  const [value, setValue] = useState(search || '');


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

  const onIconClick = useCallback(
    () => {
      if (!isNil(inputRef.current)) {
        inputRef.current.focus();
      }
    },
    [inputRef],
  );

  const onSearchChange = useOnSearchChange(setValue);
  const onReset = useOnReset(setValue, searchParams, history, onIconClick);
  const onActive = useOnActive(
    searchParams,
    history,
    isOverlay,
    isSearchActive,
    locationPrefix,
    setValue,
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
        inputClasses={{ root: classes.baseInputRoot }}
        value={isOverlay ? value : ''}
        readOnly={!isOverlay}
        onChange={onSearchChange}
        onFocus={onActive}
        onIconClick={onIconClick}
        {...rest}
      >
        {hasSearch && isOverlay && (
          <div
            className={classes.clearButton}
          >
            <IconButton
              aria-label="Clear"
              type="reset"
              onClick={onReset}
            >
              <CancelIcon />
            </IconButton>
          </div>
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
