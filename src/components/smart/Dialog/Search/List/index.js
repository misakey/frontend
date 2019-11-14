import React, { useMemo, useCallback, useState, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';
import { denormalize } from 'normalizr';
import { connect } from 'react-redux';

import routes from 'routes';
import API from '@misakey/api';
import { makeStyles } from '@material-ui/core/styles';

import ApplicationSchema from 'store/schemas/Application';
import {
  applicationsOnFetch,
  screenApplicationsBoxesAdd,
} from 'store/actions/screens/applications';

import useAsync from '@misakey/hooks/useAsync';

import partition from '@misakey/helpers/partition';
// import prop from '@misakey/helpers/prop';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isEmpty from '@misakey/helpers/isEmpty';

import Typography from '@material-ui/core/Typography';
import ApplicationListGroups from 'components/dumb/Application/List/Groups';
import SplashScreen from 'components/dumb/SplashScreen';
import DialogSearchBottomAction from './BottomAction';

// LAZY
const SuggestionApplicationListItem = lazy(() => import('components/dumb/ListItem/Application/Suggestion'));

// CONSTANTS
const SEARCH_MIN_LENGTH = 1;

// @FIXME add to js-common
const PAGES_ROSES_FIND = {
  method: 'GET',
  path: '/application-info',
};

// HELPERS
// const producerIdProp = prop('producerId');

// const fetchBoxes = () => API.use(API.endpoints.application.box.find)
//   .build()
//   .send();

// const fetchApplicationsByIds = (ids, isAuthenticated) => {
//   const endpoint = PAGES_ROSES_FIND;
//   endpoint.auth = isAuthenticated;

//   return API.use(endpoint)
//     .build(undefined, undefined, { ids: ids.join(',') })
//     .send();
// };

const searchApplications = (search, isAuthenticated) => {
  const endpoint = PAGES_ROSES_FIND;
  endpoint.auth = isAuthenticated;

  return API.use(endpoint)
    .build(undefined, undefined, { search, published: true })
    .send();
};

// HOOKS
const useStyles = makeStyles(() => ({
  main: {
    height: '100%',
  },
  overlay: {
    height: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    textTransform: 'uppercase',
  },
  preventScroll: {
    overflow: 'hidden',
  },
  navBlock: {
    height: 'inherit',
    width: '100%',
  },
}));

const useGetApplications = (
  search,
  shouldFetch,
  isAuthenticated,
  setFetching,
  dispatchApplications,
  // dispatchBoxes,
) => useCallback(
  () => {
    if (!shouldFetch) { return; }

    // const boxesPromise = !isAuthenticated
    //   ? Promise.resolve([])
    //   : fetchBoxes().then((response) => {
    //     if (response.length > 0) {
    //       const boxIds = response.map(objectToCamelCase).map(producerIdProp);
    //       dispatchBoxes(boxIds);
    //       return fetchApplicationsByIds(boxIds, isAuthenticated);
    //     }
    //     return [];
    //   });
    const searchPromise = isEmpty(search)
      ? Promise.resolve([]) // empty application list when search is empty
      : searchApplications(search, isAuthenticated);

    // const promise = Promise.all([boxesPromise, searchPromise]);
    const promise = searchPromise;
    setFetching(true);
    promise.then((searchedApplications) => {
      // @FIXME use when filter and layout for databoxes are handled
      // const applications = boxesApplications
      //   // @FIXME find a better way to distinguish appboxes and apps
      //   .map((app) => ({ hasBoxes: true, ...app }))
      //   .concat(searchedApplications)
      const applications = searchedApplications
        .map(objectToCamelCase);
      dispatchApplications(applications);
    })
      .finally(() => setFetching(false));
  },
  [search, shouldFetch, isAuthenticated, setFetching, dispatchApplications,
    // dispatchBoxes,
  ],
);

const useGroups = (entities, linkedLinkTo, searchedLinkTo, t) => useMemo(
  () => {
    const groups = [];
    const [linked, suggested] = partition(entities, (app) => app.hasBoxes);
    if (linked.length > 0) {
      groups.push({
        title: t('screens:applications.linked.subtitle'),
        applications: linked,
        linkTo: linkedLinkTo,
      });
    }
    if (suggested.length > 0) {
      groups.push({
        title: t('screens:applications.suggested.subtitle'),
        applications: suggested,
        linkTo: searchedLinkTo,
        rowRenderer: SuggestionApplicationListItem,
      });
    }
    return groups;
  },
  [entities, linkedLinkTo, searchedLinkTo, t],
);

// COMPONENTS
const DialogSearchList = ({
  isAuthenticated,
  entities,
  value,
  t,
  dispatchApplications,
  dispatchBoxes,
}) => {
  const classes = useStyles();

  const [isFetching, setFetching] = useState(false);

  const shouldFetch = useMemo(
    () => {
      const { length } = value;
      return length >= SEARCH_MIN_LENGTH || length === 0;
    },
    [value],
  );

  const linkedLinkTo = useMemo(
    () => routes.citizen.application.personalData,
    [],
  );

  const searchedLinkTo = useMemo(
    () => routes.citizen.application.info,
    [],
  );

  const groups = useGroups(entities, linkedLinkTo, searchedLinkTo, t);

  const getApplications = useGetApplications(
    value,
    shouldFetch,
    isAuthenticated,
    setFetching,
    dispatchApplications,
    dispatchBoxes,
  );

  const emptyNoSearch = useMemo(
    () => isEmpty(groups) && isEmpty(value),
    [groups, value],
  );

  useAsync(getApplications);
  return (
    <Suspense fallback={<SplashScreen />}>
      <div className={classes.main}>
        <div className={classes.overlay}>
          {emptyNoSearch
            ? (
              <Typography variant="body2" color="textSecondary" align="center" className={classes.emptyTitle}>
                {t('screens:applications.empty.subtitle')}
              </Typography>
            )
            : (
              <nav className={clsx(classes.navBlock, { [classes.preventScroll]: isFetching })}>
                <ApplicationListGroups
                  groups={groups}
                  BottomAction={DialogSearchBottomAction}
                />
                {isFetching && <SplashScreen />}
              </nav>
            )}
        </div>
      </div>
    </Suspense>
  );
};

DialogSearchList.propTypes = {
  value: PropTypes.string,
  // withTranslation
  t: PropTypes.func.isRequired,
  // STATE
  isAuthenticated: PropTypes.bool,
  // hasBoxes: PropTypes.bool,
  entities: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  // DISPATCH
  dispatchApplications: PropTypes.func.isRequired,
  dispatchBoxes: PropTypes.func.isRequired,
};

DialogSearchList.defaultProps = {
  value: '',
  isAuthenticated: false,
  // hasBoxes: false,
  entities: [],
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: !!state.auth.token,
  hasBoxes: state.screens.applications.boxes.length > 0,
  entities: denormalize(
    state.screens.applications.ids,
    ApplicationSchema.collection,
    state.entities,
  ),
});

const mapDispatchToProps = (dispatch) => ({
  dispatchApplications: (applications) => {
    dispatch(applicationsOnFetch(applications));
  },
  dispatchBoxes: (ids) => {
    dispatch(screenApplicationsBoxesAdd(ids));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation('screens')(DialogSearchList));
