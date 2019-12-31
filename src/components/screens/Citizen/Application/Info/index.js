import React, { useState, useCallback, useMemo } from 'react';
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

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import ApplicationHeader from 'components/dumb/Application/Header';
import { getStyleForContainerScroll } from 'components/dumb/Screen';
import ApplicationNavTabs from 'components/screens/Citizen/Application/Info/Nav';
import ApplicationBox from 'components/screens/Citizen/Application/Box';
import UserContributionDialog from 'components/smart/UserContributionDialog';

import Content from 'components/screens/Citizen/Application/Info/Content';
import MyAccount from 'components/screens/Citizen/Application/Info/MyAccount';
import ThirdParty from 'components/screens/Citizen/Application/Info/ThirdParty';

import { IS_PLUGIN } from 'constants/plugin';

const NAV_BAR_HEIGHT = 34;
const NAV_BAR_STICKY = IS_PLUGIN;

// STYLES
const useStyles = makeStyles((theme) => ({
  content: getStyleForContainerScroll(theme, NAV_BAR_HEIGHT, { gutters: !IS_PLUGIN }),
  container: {
    padding: 0,
  },
  nav: {
    padding: '0 1rem',
  },
}));

// CONSTANTS
const APPLICATION_CONTRIBUTION_ENDPOINT = {
  method: 'POST',
  path: '/application-contributions',
  auth: true,
};

// COMPONENTS
function ApplicationInfo({
  userId, entity, isAuthenticated,
  isFetching, match, t,
}) {
  const classes = useStyles();
  const [isOpenUserContributionDialog, setOpenUserContributionDialog] = useState(false);
  const [userContributionType, setUserContributionType] = useState('');
  const [contentRef, setContentRef] = React.useState(null);

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
    (dpoEmail, link) => API.use(APPLICATION_CONTRIBUTION_ENDPOINT)
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
      .catch((e) => {
        const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
        enqueueSnackbar(text, { variant: 'error' });
      })
      .finally(closeUserContributionDialog),
    [userId, id, closeUserContributionDialog, t, enqueueSnackbar],
  );

  return (
    <Container maxWidth="md" className={clsx({ [classes.container]: NAV_BAR_STICKY })}>
      <UserContributionDialog
        open={isOpenUserContributionDialog}
        onClose={closeUserContributionDialog}
        onSuccess={onUserContribute}
        userContributionType={userContributionType}
        appName={name}
      />

      {!IS_PLUGIN && (
        <ApplicationHeader
          application={entity}
          isLoading={isFetching}
          onContributionDpoEmailClick={onContributionDpoEmailClick}
          readOnly={unknown}
          mb={3}
        />
      )}
      {!unknown && !isFetching && (
        <ApplicationNavTabs
          className={clsx({ [classes.nav]: NAV_BAR_STICKY })}
          elevationScrollTarget={contentRef}
          mainDomain={mainDomain}
          isAuthenticated={isAuthenticated}
        />
      )}

      <Box
        px={2}
        className={clsx({ [classes.content]: NAV_BAR_STICKY })}
        ref={(ref) => setContentRef(ref)}
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
              <Content
                entity={entity}
                isLoading={isFetching}
                onContributionDpoEmailClick={onContributionDpoEmailClick}
                onContributionLinkClick={onContributionLinkClick}
              />
            )}
          />
        </Switch>
      </Box>


    </Container>
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
};

ApplicationInfo.defaultProps = {
  userId: null,
  entity: null,
};

export default connect((state) => ({
  userId: state.auth.userId,
  isAuthenticated: !!state.auth.token,
}))(withTranslation(['screens'])(ApplicationInfo));
