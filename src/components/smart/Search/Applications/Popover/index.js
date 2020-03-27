import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { withTranslation } from 'react-i18next';
import { useLocation, useHistory } from 'react-router-dom';

import { SEARCH_WIDTH_LG, SEARCH_WIDTH_MD } from '@misakey/ui/constants/sizes';

import { searchApplications } from 'store/actions/search';
import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';
import getNextSearch from '@misakey/helpers/getNextSearch';
import debounce from '@misakey/helpers/debounce';
import isArray from '@misakey/helpers/isArray';
import isObject from '@misakey/helpers/isObject';

import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import makeStyles from '@material-ui/core/styles/makeStyles';
import Popover from '@material-ui/core/Popover';
import PopoverApplicationsList from 'components/smart/Search/Applications/Popover/Steps/ApplicationsList';
import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';
import useSearchApplications from '@misakey/hooks/useSearchApplications';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import { WORKSPACE } from 'constants/workspaces';

const ANCHOR_ORIGIN = {
  vertical: 'bottom',
  horizontal: 'right',
};

const TRANSFORM_ORIGIN = {
  vertical: 'bottom',
  horizontal: 'right',
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  popoverPaper: ({ noTopMargin }) => ({
    marginTop: noTopMargin ? 0 : theme.spacing(2),
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

const STEPS = {
  APPLICATIONS_LIST: 'applications_list',
  REQUEST_CREATION: 'request_creation',
};


// @FIXME added this because there were weird errors with list containing undefined values
const useCleanList = (list) => useMemo(
  () => (isArray(list) ? list.filter(isObject) : []),
  [list],
);


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
  suggested,
  linked,
}) => {
  const [step, setStep] = useState(STEPS.APPLICATIONS_LIST);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isFull = useMediaQuery(theme.breakpoints.down('xs'));

  const classes = useStyles({ noTopMargin });

  const { search: locationSearch } = useLocation();
  const { search = '' } = useLocationSearchParams();

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
      setStep(STEPS.APPLICATIONS_LIST);
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

  const suggestedOptions = useCleanList(suggested);

  const linkedOptions = useCleanList(linked);

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

  // update router when popover opens
  useEffect(
    () => {
      if (isNil(search) && open) {
        updateRouter(search);
      }
    },
    [open, search, updateRouter],
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
      {step === STEPS.APPLICATIONS_LIST && (
        <PopoverApplicationsList
          open={open}
          onClose={onClose}
          onSelect={onSelect}
          onSearchClose={onSearchClose}
          updateRouter={updateRouter}
          suggested={suggested}
          linked={linked}
          loading={loading}
          search={search}
          suggestedOptions={suggestedOptions}
          linkedOptions={linkedOptions}
        />
      )}
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
  noTopMargin: false,
  suggested: null,
  linked: null,
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  suggested: denormalize(
    state.search.suggestedIds,
    ApplicationSchema.collection,
    state.entities,
  ),
  linked: denormalize(
    state.search.linkedIds,
    ApplicationSchema.collection,
    state.entities,
  ),
  isAuthenticated: !!state.auth.token,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchReceive: (applications) => dispatch(searchApplications(applications)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation('common')(SearchApplicationsPopover));
