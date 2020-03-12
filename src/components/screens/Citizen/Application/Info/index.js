import React, { Suspense, lazy, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import clsx from 'clsx';

import API from '@misakey/api';
import ApplicationSchema from 'store/schemas/Application';

import routes from 'routes';
import { Route, Switch, Redirect, generatePath } from 'react-router-dom';

import { IS_PLUGIN } from 'constants/plugin';

import compose from '@misakey/helpers/compose';
import prop from '@misakey/helpers/prop';
import head from '@misakey/helpers/head';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import isNil from '@misakey/helpers/isNil';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import Screen, { getStyleForContainerScroll, SCREEN_STATE_PROPTYPES } from 'components/dumb/Screen';
import DefaultSplashScreen from '@misakey/ui/Screen/Splash';
import ApplicationInfoNav from 'components/screens/Citizen/Application/Info/Nav';
import UserContributionDialog from 'components/smart/UserContributionDialog';
import { addToUserApplications, removeFromUserApplications } from 'store/actions/applications/userApplications';
import { WORKSPACE } from 'constants/workspaces';


// LAZY
const ApplicationVault = lazy(() => import('components/screens/Citizen/Application/Info/Vault'));
const Feedback = lazy(() => import('components/screens/Citizen/Application/Info/Feedback'));
const Legal = lazy(() => import('components/screens/Citizen/Application/Info/Legal'));
const More = lazy(() => import('components/screens/Citizen/Application/Info/More'));

// CONSTANTS
const NAV_BAR_HEIGHT = 33;

// STYLES
const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(1, 2),
    position: 'relative', // For DefaultSplashScreen not to take more than full height
    boxSizing: 'border-box',
  },
  pluginContent: getStyleForContainerScroll(theme, NAV_BAR_HEIGHT),
  container: {
    marginTop: NAV_BAR_HEIGHT,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  nav: {
    padding: '0 1rem',
  },
}));

// CONSTANTS
const ENDPOINTS = {
  applicationContribution: {
    create: {
      method: 'POST',
      path: '/application-contributions',
      auth: true,
    },
  },
  userApplication: {
    read: {
      method: 'GET',
      path: '/user-applications',
      auth: true,
    },
    create: {
      method: 'POST',
      path: '/user-applications',
      auth: true,
    },
    delete: {
      method: 'DELETE',
      path: '/user-applications/:id',
      auth: true,
    },
  },
};

// HELPERS

const getUserApplicationId = compose(
  prop('id'),
  head,
);

const createUserApplication = (form) => API
  .use(ENDPOINTS.userApplication.create)
  .build(null, objectToSnakeCase(form))
  .send();


// COMPONENTS
function ApplicationInfo({
  userId, entity, isAuthenticated,
  match, t, screenProps, dispatch,
}) {
  const classes = useStyles();
  const [isOpenUserContributionDialog, setOpenUserContributionDialog] = useState(false);
  const [applicationLinkId, setApplicationLinkId] = useState(null);
  const [userContributionType, setUserContributionType] = useState(undefined);
  const [contentRef, setContentRef] = React.useState(undefined);

  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  const mounted = useRef(false);

  const { mainDomain } = match.params;
  const { name, id } = useMemo(
    () => entity,
    [entity],
  );

  const { isLoading } = useMemo(() => screenProps.state, [screenProps]);

  const { enqueueSnackbar } = useSnackbar();

  const closeUserContributionDialog = useCallback(() => {
    setOpenUserContributionDialog(false);
  }, [setOpenUserContributionDialog]);

  const openUserContributionDialog = useCallback((type) => {
    setUserContributionType(type);
    setOpenUserContributionDialog(true);
  }, [setOpenUserContributionDialog, setUserContributionType]);

  const onContributionDpoEmailClick = useCallback(
    () => openUserContributionDialog('dpoEmail'),
    [openUserContributionDialog],
  );
  const onContributionLinkClick = useCallback(
    () => openUserContributionDialog('link'),
    [openUserContributionDialog],
  );

  const onUserContribute = useCallback(
    (dpoEmail, link) => API.use(ENDPOINTS.applicationContribution.create)
      .build(null, {
        user_id: userId,
        dpo_email: dpoEmail,
        link,
        application_id: id,
      })
      .send()
      .then(() => {
        const text = t('citizen:application.info.userContribution.success');
        enqueueSnackbar(text, { variant: 'success' });
      })
      .catch(handleGenericHttpErrors)
      .finally(closeUserContributionDialog),
    [userId, id, closeUserContributionDialog, t, enqueueSnackbar, handleGenericHttpErrors],
  );

  const onToggleLinked = useCallback(
    () => {
      if (isNil(applicationLinkId)) {
        createUserApplication({ userId, applicationId: id })
          .then((userApplication) => {
            setApplicationLinkId(userApplication.id);
            dispatch(addToUserApplications(WORKSPACE.CITIZEN, mainDomain));
          })
          .catch(handleGenericHttpErrors);
      } else {
        API.use(ENDPOINTS.userApplication.delete)
          .build({ id: applicationLinkId })
          .send()
          .then(() => {
            setApplicationLinkId(null);
            dispatch(removeFromUserApplications(WORKSPACE.CITIZEN, mainDomain));
          })
          .catch(handleGenericHttpErrors);
      }
    },
    [applicationLinkId, userId, id, handleGenericHttpErrors, dispatch, mainDomain],
  );

  const getCurrentApplicationLink = useCallback(
    () => {
      API.use(ENDPOINTS.userApplication.read)
        .build(null, null, {
          user_id: userId,
          application_id: id,
        })
        .send()
        .then((userApplications) => {
          const userApplicationId = getUserApplicationId(userApplications);
          if (!isNil(userApplicationId)) {
            setApplicationLinkId(userApplicationId);
          }
        })
        .catch(handleGenericHttpErrors);
    },
    [userId, id, handleGenericHttpErrors],
  );

  const defaultRoute = useMemo(() => generatePath(
    routes.citizen.application.vault,
    { mainDomain },
  ),
  [mainDomain]);

  const shouldFetch = useMemo(
    () => !isNil(id) && !isNil(userId),
    [id, userId],
  );

  useEffect(
    () => {
      if (mounted.current === false && shouldFetch) {
        getCurrentApplicationLink();
        mounted.current = true;
      }
    },
    [mounted, getCurrentApplicationLink, shouldFetch],
  );

  return (
    <Screen {...screenProps} preventSplashScreen>
      <Container
        maxWidth="md"
        className={classes.container}
      >
        <UserContributionDialog
          open={isOpenUserContributionDialog}
          onClose={closeUserContributionDialog}
          onSuccess={onUserContribute}
          userContributionType={userContributionType}
          appName={name}
        />
        <ApplicationInfoNav
          className={clsx({ [classes.nav]: IS_PLUGIN })}
          elevationScrollTarget={contentRef}
          mainDomain={mainDomain}
          isAuthenticated={isAuthenticated}
        />

        <Box
          className={clsx(classes.content, { [classes.pluginContent]: IS_PLUGIN })}
          ref={(ref) => IS_PLUGIN && setContentRef(ref)}
        >
          <Suspense fallback={<DefaultSplashScreen />}>
            {isLoading ? (
              <DefaultSplashScreen />
            ) : (
              <Switch>
                <Route
                  exact
                  path={routes.citizen.application.vault}
                  render={(routerProps) => (
                    <ApplicationVault
                      onContributionDpoEmailClick={onContributionDpoEmailClick}
                      application={entity}
                      {...routerProps}
                    />
                  )}
                />
                <Route
                  path={routes.citizen.application.feedback}
                  render={(routerProps) => (
                    <Feedback
                      application={entity}
                      {...routerProps}
                    />
                  )}
                />
                <Route
                  path={routes.citizen.application.legal}
                  render={(routerProps) => (
                    <Legal
                      application={entity}
                      onContributionLinkClick={onContributionLinkClick}
                      {...routerProps}
                    />
                  )}
                />
                <Route
                  path={routes.citizen.application.more}
                  render={(routerProps) => (
                    <More
                      application={entity}
                      isLinked={!isNil(applicationLinkId)}
                      toggleLinked={onToggleLinked}
                      isAuthenticated={isAuthenticated}
                      {...routerProps}
                    />
                  )}
                />
                {!isNil(id) && (
                  <Redirect
                    from={routes.citizen.application._}
                    exact
                    to={defaultRoute}
                  />
                )}
              </Switch>
            )}
          </Suspense>
        </Box>
      </Container>
    </Screen>
  );
}

ApplicationInfo.propTypes = {
  userId: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({ mainDomain: PropTypes.string }),
    path: PropTypes.string,
  }).isRequired,
  t: PropTypes.func.isRequired,
  screenProps: PropTypes.shape({
    state: SCREEN_STATE_PROPTYPES,
  }).isRequired,
};

ApplicationInfo.defaultProps = {
  userId: null,
  entity: null,
};

export default connect((state) => ({
  userId: state.auth.userId,
  isAuthenticated: !!state.auth.token,
}))(withTranslation(['citizen'])(ApplicationInfo));
