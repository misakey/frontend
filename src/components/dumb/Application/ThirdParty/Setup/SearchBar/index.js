import React, { useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import CancelIcon from '@material-ui/icons/Cancel';
import TuneIcon from '@material-ui/icons/Tune';
import DoneIcon from '@material-ui/icons/Done';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';

import {
  setApps,
} from 'store/actions/screens/thirdparty';

import isNil from '@misakey/helpers/isNil';
import isString from '@misakey/helpers/isString';
import getSearchParams from '@misakey/helpers/getSearchParams';

import InputSearch from 'components/dumb/Input/Search';

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

const useStyles = makeStyles(() => ({
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  history,
  onFetching,
  onSearch,
  onFiltersChange,
  t,
  ...rest
}) {
  const inputRef = useRef();

  const classes = useStyles();
  const queryParams = getSearchParams(location.search);

  const search = queryParams.search || '';

  const [showFilters, setShowFilters] = useState(false);
  const isSearchActive = useIsSearchActive(search);
  const hasSearch = useHasSearch(search);

  const onSearchChange = useOnSearchChange(onSearch);
  const onReset = useOnReset(onSearch, inputRef);
  const onActive = useOnActive(inputRef);

  return (
    <>
      <InputSearch
        ref={inputRef}
        {...rest}
        autoFocus={isSearchActive}
        value={search}
        onChange={onSearchChange}
        onFocus={onActive}
        Icon={ArrowBackIcon}
        onIconClick={() => history.goBack()}
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
        <IconButton
          color={queryParams.mainPurpose || queryParams.mainDomain ? 'secondary' : 'primary'}
          aria-label="Tune"
          onClick={() => { setShowFilters(!showFilters); }}
        >
          <TuneIcon />
        </IconButton>
      </InputSearch>
      <Collapse in={showFilters}>
        <List
          aria-labelledby="nested-list-subheader"
          subheader={(
            <ListSubheader component="div" id="nested-list-subheader">
              {t('screens:application.thirdParty.filters.mainPurpose.title')}
            </ListSubheader>
          )}
          className={classes.root}
        >
          { ['essentials', 'advertising', 'analytics', 'social_interaction', 'personalization', 'other'].map((purpose) => (
            <ListItem
              button
              key={purpose}
              onClick={(() => { onFiltersChange(purpose); setShowFilters(false); })}
            >
              <ListItemText primary={t(`screens:application.thirdParty.categories.${purpose}`)} />
              {queryParams.mainPurpose === purpose && (
                <ListItemIcon>
                  <DoneIcon color="secondary" />
                </ListItemIcon>
              )}
            </ListItem>
          ))}
        </List>
        {queryParams.mainDomain && (
          <List
            aria-labelledby="nested-list-subheader"
            subheader={(
              <ListSubheader component="div" id="nested-list-subheader">
                {t('screens:application.thirdParty.filters.mainDomain.title')}
              </ListSubheader>
            )}
            className={classes.root}
          >
            <ListItem>
              <ListItemText primary={queryParams.mainDomain} />
              <ListItemIcon>
                <DoneIcon color="secondary" />
              </ListItemIcon>
            </ListItem>
          </List>
        )}
      </Collapse>
    </>

  );
}

ThirdPartySearchBar.propTypes = {
  dispatchApps: PropTypes.func.isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string, search: PropTypes.string }).isRequired,
  history: PropTypes.shape({ goBack: PropTypes.func }).isRequired,
  onFetching: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
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
