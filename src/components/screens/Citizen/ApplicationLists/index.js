import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';
import { denormalize } from 'normalizr';

import { connect } from 'react-redux';

import routes from 'routes';
import API from '@misakey/api';
import { makeStyles } from '@material-ui/core/styles';

import { LEFT_PORTAL_ID } from 'components/smart/Layout';

import ApplicationSchema from 'store/schemas/Application';
import {
  applicationsOnFetch,
  screenApplicationsBoxesAdd,
} from 'store/actions/screens/applications';

import useAsync from '@misakey/hooks/useAsync';

import getSearchParams from '@misakey/helpers/getSearchParams';
import compose from '@misakey/helpers/compose';
import partition from '@misakey/helpers/partition';
// import prop from '@misakey/helpers/prop';
import propOr from '@misakey/helpers/propOr';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import ButtonGoBack from '@misakey/ui/Button/GoBack';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Portal from '@misakey/ui/Portal';
import ApplicationList from 'components/dumb/Application/List';
import SplashScreen from '@misakey/ui/SplashScreen';

import './index.scss';

// CONSTANTS
const MAX_WIDTH = 'md';
const SEARCH_MIN_LENGTH = 3;

// @FIXME add to js-common
const PAGES_ROSES_FIND = {
  method: 'GET',
  path: '/applications',
};

// HELPERS
// const producerIdProp = prop('producerId');
const getSearch = compose(
  propOr('', 'search'),
  getSearchParams,
);

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
    .build(undefined, undefined, { search })
    .send();
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  titleUppercase: {
    textTransform: 'uppercase',
  },
  navBlock: {
    height: `calc(100% - ${theme.typography.body2.fontSize} * ${theme.typography.body2.lineHeight})`,
  },
  halfBlock: {
    height: '50%',
    paddingTop: theme.spacing(3),
    '&:first-child:last-child': {
      height: '100%',
    },
  },
  goBackRoot: {
    marginLeft: 0,
    marginRight: theme.spacing(1),
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
    const searchPromise = searchApplications(search, isAuthenticated);

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

// COMPONENTS
const ApplicationListsScreen = ({
  isAuthenticated,
  hasBoxes,
  entities,
  history,
  location: { search: locationSearch },
  t,
  dispatchApplications,
  dispatchBoxes,
}) => {
  const classes = useStyles();

  const [isFetching, setFetching] = useState(false);

  const search = useMemo(
    () => getSearch(locationSearch),
    [locationSearch],
  );

  const shouldFetch = useMemo(
    () => {
      const { length } = search;
      return length >= SEARCH_MIN_LENGTH || length === 0;
    },
    [search],
  );

  const linkedLinkTo = useMemo(
    () => routes.citizen.application.personalData,
    [],
  );

  const searchedLinkTo = useMemo(
    () => routes.citizen.application.info,
    [],
  );

  const [linkedApplications, applications] = useMemo(
    () => partition(entities, (app) => app.hasBoxes),
    [entities],
  );

  const getApplications = useGetApplications(
    search,
    shouldFetch,
    isAuthenticated,
    setFetching,
    dispatchApplications,
    dispatchBoxes,
  );

  useAsync(getApplications);

  return (
    <div className="Applications">
      <Portal elementId={LEFT_PORTAL_ID}>
        <ButtonGoBack history={history} className={classes.goBackRoot} />
      </Portal>
      <div className="overlay">
        {isAuthenticated && hasBoxes && (
          <div className={classes.halfBlock}>
            <Container maxWidth={MAX_WIDTH}>
              <Typography variant="body2" color="textSecondary" align="left" className={classes.titleUppercase}>
                {t('screens:applications.linked.subtitle')}
              </Typography>
            </Container>
            <nav className={clsx(classes.navBlock, { 'prevent-scroll': isFetching })}>
              <ApplicationList
                applications={linkedApplications}
                linkTo={linkedLinkTo}
              />
              {isFetching && <SplashScreen />}
            </nav>

          </div>
        )}
        <div className={classes.halfBlock}>
          <Container maxWidth={MAX_WIDTH}>
            <Typography variant="body2" color="textSecondary" align="left" className={classes.titleUppercase}>
              {t('screens:applications.searched.subtitle')}
            </Typography>
          </Container>
          <nav className={clsx(classes.navBlock, { 'prevent-scroll': isFetching })}>
            <ApplicationList
              applications={applications}
              linkTo={searchedLinkTo}
              maxWidth={MAX_WIDTH}
            />
            {isFetching && <SplashScreen />}
          </nav>
        </div>
      </div>
    </div>
  );
};

ApplicationListsScreen.propTypes = {
  // ROUTER
  history: PropTypes.object.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
  // STATE
  isAuthenticated: PropTypes.bool,
  hasBoxes: PropTypes.bool,
  entities: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  // DISPATCH
  dispatchApplications: PropTypes.func.isRequired,
  dispatchBoxes: PropTypes.func.isRequired,
};

ApplicationListsScreen.defaultProps = {
  isAuthenticated: false,
  hasBoxes: false,
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation('screens')(ApplicationListsScreen));
