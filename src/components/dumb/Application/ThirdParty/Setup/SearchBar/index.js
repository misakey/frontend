import React, { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import CancelIcon from '@material-ui/icons/Cancel';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';

import {
  setApps,
} from 'store/actions/screens/thirdparty';

import isNil from '@misakey/helpers/isNil';
import isString from '@misakey/helpers/isString';
import getSearchParams from '@misakey/helpers/getSearchParams';

import InputSearch from 'components/dumb/Input/Search';
import ApplicationImg from 'components/dumb/Application/Img';

// HELPERS
const getOnSearchChange = (onSearch) => ({ target: { value } }) => {
  if (isString(value)) {
    onSearch(value);
  }
};
const getOnReset = (onSearch, inputRef) => ({ noFocus }) => {
  onSearch('');
  if (!isNil(inputRef.current) && noFocus !== true) {
    inputRef.current.focus();
  }
};

const getIsSearchActive = (search) => !isNil(search);
const getHasSearch = (search) => getIsSearchActive(search) && search.length > 0;

// HOOKS
const useOnSearchChange = (setSearch) => useMemo(() => getOnSearchChange(setSearch), [setSearch]);
const useOnReset = (setSearch, inputRef) => useMemo(
  () => getOnReset(setSearch, inputRef), [setSearch, inputRef],
);

const useStyles = makeStyles((theme) => ({
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    height: '35px',
    width: '35px',
    margin: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
}));

const useOnActive = (inputRef) => useMemo(() => () => {
  if (!isNil(inputRef.current)) {
    inputRef.current.focus();
  }
}, [inputRef]);

const useIsSearchActive = (search) => useMemo(() => getIsSearchActive(search), [search]);
const useHasSearch = (search) => useMemo(() => getHasSearch(search), [search]);

// COMPONENTS
function ThirdPartySearchBar({
  dispatchApps,
  location,
  entity,
  onIconClick,
  onFetching,
  onSearch,
  onFiltersChange,
  t,
  ...rest
}) {
  const inputRef = useRef();

  const classes = useStyles();
  const queryParams = getSearchParams(location.search);

  const initialsName = useMemo(() => (isNil(entity) ? '' : entity.name.slice(0, 3)), [entity]);

  const search = queryParams.search || '';

  const isSearchActive = useIsSearchActive(search);
  const hasSearch = useHasSearch(search);

  const onSearchChange = useOnSearchChange(onSearch);
  const onReset = useOnReset(onSearch, inputRef);
  const onActive = useOnActive(inputRef);

  return (
    <InputSearch
      ref={inputRef}
      {...rest}
      autoFocus={isSearchActive}
      value={search}
      onChange={onSearchChange}
      onFocus={onActive}
      Icon={ArrowBackIcon}
      onIconClick={onIconClick}
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
      {entity && (
        <ApplicationImg
          className={classes.avatar}
          src={entity.logoUri}
          alt={t('screens:application.thirdParty.filters.logoAlt', { mainDomain: entity.name })}
        >
          {initialsName}
        </ApplicationImg>
      )}
    </InputSearch>
  );
}

ThirdPartySearchBar.propTypes = {
  dispatchApps: PropTypes.func.isRequired,
  entity: PropTypes.shape({ name: PropTypes.string, logoUri: PropTypes.string }),
  location: PropTypes.shape({ pathname: PropTypes.string, search: PropTypes.string }).isRequired,
  onIconClick: PropTypes.func.isRequired,
  onFetching: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

ThirdPartySearchBar.defaultProps = {
  entity: null,
};

const mapDispatchToProps = (dispatch) => ({
  dispatchApps: (data) => {
    dispatch(setApps(data));
  },
});

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation(['screens'])(ThirdPartySearchBar));
