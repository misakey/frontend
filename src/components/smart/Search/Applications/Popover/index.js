import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { withTranslation } from 'react-i18next';

import { SEARCH_WIDTH_LG, SEARCH_WIDTH_MD } from '@misakey/ui/constants/sizes';
import { WORKSPACE } from 'constants/workspaces';
import STEPS_SEARCH_PARAMS, { SEARCH, REQUEST } from 'constants/search/application/params';
import { searchApplications } from 'store/actions/search';
import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';
import isArray from '@misakey/helpers/isArray';
import compose from '@misakey/helpers/compose';
import any from '@misakey/helpers/any';
import props from '@misakey/helpers/props';
import getNextSearch from '@misakey/helpers/getNextSearch';
import debounce from '@misakey/helpers/debounce';
import fromPairs from '@misakey/helpers/fromPairs';
import getSearchParams from '@misakey/helpers/getSearchParams';

import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';
import useSearchApplications from '@misakey/hooks/useSearchApplications';
import { useLocation, useHistory } from 'react-router-dom';
import makeStyles from '@material-ui/core/styles/makeStyles';

import RouteSearch from 'components/smart/Route/Search';
import SwitchSearch from 'components/smart/Switch/Search';
import Popover from '@material-ui/core/Popover';
import SearchApplicationsPopoverList from 'components/smart/Search/Applications/Popover/List';
import SearchApplicationsPopoverRequest from 'components/smart/Search/Applications/Popover/Request';

// CONSTANTS
const ANCHOR_ORIGIN = {
  vertical: 'bottom',
  horizontal: 'right',
};

const TRANSFORM_ORIGIN = {
  vertical: 'bottom',
  horizontal: 'right',
};

// HELPERS
const isNotNil = (elem) => !isNil(elem);

const hasStepsSearchParam = compose(
  any(isNotNil),
  props(STEPS_SEARCH_PARAMS),
);

const getCleanList = (list) => (isArray(list)
  ? list.filter(isNotNil) // remove nil elements from list
  : list);

// HOOKS
const useStyles = makeStyles((theme) => ({
  popoverPaper: ({ noTopMargin, fixedHeight }) => ({
    marginTop: noTopMargin ? 0 : theme.spacing(1),
    maxHeight: noTopMargin ? null : `calc(100% - 32px - ${theme.spacing(1)}px)`,
    minHeight: fixedHeight ? `calc(100% - 32px - ${noTopMargin ? 0 : theme.spacing(1)}px)` : null,
    [theme.breakpoints.down('xs')]: {
      maxWidth: '100%',
      maxHeight: '100%',
      width: '100%',
      height: '100%',
      marginTop: 0,
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
  }),
}));

// COMPONENTS
const SearchApplicationsPopover = ({
  id,
  anchorEl,
  anchorOrigin,
  onClose,
  dispatchReceive,
  isAuthenticated,
  transformOrigin,
  noTopMargin,
  fixedHeight,
  suggested,
  linked,
}) => {
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isFull = useMediaQuery(theme.breakpoints.down('xs'));

  const classes = useStyles({ noTopMargin, fixedHeight });

  const { search: locationSearch } = useLocation();
  const locationSearchParams = useLocationSearchParams();

  const { search } = locationSearchParams;
  const searchValue = useMemo(
    () => search || '',
    [search],
  );

  // popover is active once one of its steps is part of location search
  const popoverActive = useMemo(
    () => hasStepsSearchParam(locationSearchParams),
    [locationSearchParams],
  );

  const { replace } = useHistory();
  const workspace = useLocationWorkspace();

  const popoverDefaultProps = useMemo(
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

  const popoverProps = useMemo(() => ({
    ...popoverDefaultProps,
    anchorOrigin,
    transformOrigin,
  }), [popoverDefaultProps, anchorOrigin, transformOrigin]);

  const open = useMemo(
    () => !isNil(anchorEl),
    [anchorEl],
  );

  const searchParamsByStep = useMemo(
    () => {
      const searchParamPairs = STEPS_SEARCH_PARAMS
        .map((value) => ([
          value,
          [value],
        ]));
      return fromPairs(searchParamPairs);
    },
    [],
  );

  const updateRouter = useCallback(
    (value) => {
      const nextSearch = getNextSearch(locationSearch, new Map([
        [SEARCH, value],
        [REQUEST, undefined],
      ]));
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

  const onSelect = useCallback(() => () => {
    if (workspace !== WORKSPACE.CITIZEN) {
      onClose();
    }
  },
  [onClose, workspace]);

  const getApplications = useSearchApplications();

  const onGetOptions = useMemo(
    () => debounce((nextSearch, isAuth) => {
      if (!isNil(nextSearch)) {
        setLoading(true);
        getApplications(nextSearch, isAuth)
          .then(dispatchReceive)
          .finally(() => { setLoading(false); });
      }
    }, 200),
    [dispatchReceive, getApplications, setLoading],
  );

  // update options anytime search or isAuthenticated change if popover is open
  // be careful not to use `useFetchEffect` as search can change more quickly than callback delay
  useEffect(
    () => {
      if (open) {
        onGetOptions(search, isAuthenticated);
      }
    },
    [isAuthenticated, onGetOptions, open, search],
  );

  // update router when popover opens and no param is set
  useEffect(
    () => {
      if (!popoverActive && open) {
        updateRouter(searchValue);
      }
    },
    [open, popoverActive, search, searchValue, updateRouter],
  );

  return (
    <Popover
      id={id}
      open={open}
      onClose={onSearchClose}
      marginThreshold={0}
      classes={{ paper: classes.popoverPaper }}
      {...popoverProps}
    >
      <SwitchSearch>
        <RouteSearch
          searchParams={searchParamsByStep[REQUEST]}
          render={({ location, ...rest }) => {
            const { request } = getSearchParams(location.search);
            return (
              <SearchApplicationsPopoverRequest
                mainDomain={request}
                location={location}
                {...rest}
              />
            );
          }}
        />
        <RouteSearch
          searchParams={searchParamsByStep[SEARCH]}
          render={(routerProps) => (
            <SearchApplicationsPopoverList
              open={open}
              onClose={onClose}
              onSelect={onSelect}
              onSearchClose={onSearchClose}
              updateRouter={updateRouter}
              suggested={suggested}
              linked={linked}
              loading={loading}
              search={search}
              {...routerProps}
            />
          )}
        />
      </SwitchSearch>
    </Popover>
  );
};

SearchApplicationsPopover.propTypes = {
  id: PropTypes.string,
  anchorEl: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  onClose: PropTypes.func.isRequired,
  anchorOrigin: PropTypes.shape({
    vertical: PropTypes.string,
    horizontal: PropTypes.string,
  }),
  transformOrigin: PropTypes.shape({
    vertical: PropTypes.string,
    horizontal: PropTypes.string,
  }),
  fixedHeight: PropTypes.bool,
  noTopMargin: PropTypes.bool,
  t: PropTypes.func.isRequired,
  // CONNECT
  suggested: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  linked: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  isAuthenticated: PropTypes.bool,
  dispatchReceive: PropTypes.func.isRequired,
};

SearchApplicationsPopover.defaultProps = {
  id: null,
  anchorEl: null,
  anchorOrigin: ANCHOR_ORIGIN,
  transformOrigin: TRANSFORM_ORIGIN,
  fixedHeight: false,
  noTopMargin: false,
  suggested: null,
  linked: null,
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  suggested: getCleanList(denormalize(
    state.search.suggestedIds,
    ApplicationSchema.collection,
    state.entities,
  )),
  linked: getCleanList(denormalize(
    state.search.linkedIds,
    ApplicationSchema.collection,
    state.entities,
  )),
  isAuthenticated: state.auth.isAuthenticated,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchReceive: (applications) => dispatch(searchApplications(applications)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation('common')(SearchApplicationsPopover));
