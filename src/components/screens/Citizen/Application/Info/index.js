import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import clsx from 'clsx';

import API from '@misakey/api';
import ApplicationSchema from 'store/schemas/Application';

import routes from 'routes';
import { Route, Switch } from 'react-router-dom';

import compose from '@misakey/helpers/compose';
import prop from '@misakey/helpers/prop';
import head from '@misakey/helpers/head';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import useHandleGenericHttpErrors from 'hooks/useHandleGenericHttpErrors';

import isNil from '@misakey/helpers/isNil';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import ApplicationHeader from 'components/dumb/Application/Header';
import Screen, { getStyleForContainerScroll } from 'components/dumb/Screen';
import ApplicationNavTabs from 'components/screens/Citizen/Application/Info/Nav';
import ApplicationBox from 'components/screens/Citizen/Application/Box';
import UserContributionDialog from 'components/smart/UserContributionDialog';

import Content from 'components/screens/Citizen/Application/Info/Content';
import MyAccount from 'components/screens/Citizen/Application/Info/MyAccount';
import ThirdParty from 'components/screens/Citizen/Application/Info/ThirdParty';

import { IS_PLUGIN } from 'constants/plugin';

const NAV_BAR_HEIGHT = 45;

// STYLES
const useStyles = makeStyles((theme) => ({
  content: {
    padding: theme.spacing(0, 2),
  },
  pluginContent: getStyleForContainerScroll(theme, NAV_BAR_HEIGHT, { gutters: !IS_PLUGIN }),
  pluginContainer: {
    padding: 0,
  },
  container: {
    marginTop: NAV_BAR_HEIGHT,
    padding: 0,
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
  isFetching, match, t, screenProps,
}) {
  const classes = useStyles();
  const [isOpenUserContributionDialog, setOpenUserContributionDialog] = useState(false);
  const [applicationLinkId, setApplicationLinkId] = useState(null);
  const [userContributionType, setUserContributionType] = useState('');
  const [contentRef, setContentRef] = React.useState(undefined);

  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  const mounted = useRef(false);

  const { mainDomain } = match.params;
  const { name, id, unknown } = useMemo(
    () => entity || {},
    [entity],
  );

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
        const text = t('application.info.userContribution.success');
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
          })
          .catch(handleGenericHttpErrors);
      } else {
        API.use(ENDPOINTS.userApplication.delete)
          .build({ id: applicationLinkId })
          .send()
          .then(() => { setApplicationLinkId(null); })
          .catch(handleGenericHttpErrors);
      }
    },
    [userId, id, applicationLinkId, handleGenericHttpErrors],
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

  useEffect(
    () => {
      if (mounted.current === false && !isNil(id) && !isNil(userId)) {
        getCurrentApplicationLink();
        mounted.current = true;
      }
    },
    [mounted, getCurrentApplicationLink, id, userId],
  );

  return (
    <Screen {...screenProps}>
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

        {!unknown && !isFetching && (
          <ApplicationNavTabs
            className={clsx({ [classes.nav]: IS_PLUGIN })}
            elevationScrollTarget={contentRef}
            mainDomain={mainDomain}
            isAuthenticated={isAuthenticated}
          />
        )}

        <Box
          className={clsx(classes.content, { [classes.pluginContent]: IS_PLUGIN })}
          ref={(ref) => IS_PLUGIN && setContentRef(ref)}
        >
          <Switch>
            <Route
              exact
              path={routes.citizen.application.vault}
              render={(routerProps) => (
                <ApplicationBox
                  onContributionDpoEmailClick={onContributionDpoEmailClick}
                  {...routerProps}
                />
              )}
            />
            <Route
              exact
              path={routes.citizen.application.thirdParty}
              render={(routerProps) => (
                <ThirdParty
                  entity={entity}
                  onContributionLinkClick={onContributionLinkClick}
                  {...routerProps}
                />
              )}
            />

            <Route
              exact
              path={routes.citizen.application.myAccount}
              render={() => <MyAccount entity={entity} />}
            />
            <Route
              exact
              path={match.path}
              render={() => (
                <>
                  <ApplicationHeader
                    application={entity}
                    isLoading={isFetching}
                    onContributionDpoEmailClick={onContributionDpoEmailClick}
                    readOnly={unknown}
                    mb={3}
                    isAuthenticated={isAuthenticated}
                    isLinked={!isNil(applicationLinkId)}
                    toggleLinked={onToggleLinked}
                  />
                  <Content
                    entity={entity}
                    isLoading={isFetching}
                    onContributionDpoEmailClick={onContributionDpoEmailClick}
                    onContributionLinkClick={onContributionLinkClick}
                  />
                </>
              )}
            />
          </Switch>
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
  isFetching: PropTypes.bool.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({ mainDomain: PropTypes.string }),
    path: PropTypes.string,
  }).isRequired,
  t: PropTypes.func.isRequired,
  screenProps: PropTypes.object.isRequired,
};

ApplicationInfo.defaultProps = {
  userId: null,
  entity: null,
};

export default connect((state) => ({
  userId: state.auth.userId,
  isAuthenticated: !!state.auth.token,
}))(withTranslation(['screens'])(ApplicationInfo));
