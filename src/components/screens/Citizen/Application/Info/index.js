import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import API from '@misakey/api';
import ApplicationSchema from 'store/schemas/Application';

import routes from 'routes';
import { Route, Switch } from 'react-router-dom';

import Container from '@material-ui/core/Container';
import PrivateRoute from '@misakey/auth/components/Route/Private';

import ApplicationHeader from 'components/dumb/Application/Header';
import ApplicationNavTabs from 'components/screens/Citizen/Application/Info/Nav';
import ApplicationBox from 'components/screens/Citizen/Application/Box';
import UserContributionDialog from 'components/smart/UserContributionDialog';

import Content from 'components/screens/Citizen/Application/Info/Content';
import MyAccount from 'components/screens/Citizen/Application/Info/MyAccount';
import ThirdParty from 'components/screens/Citizen/Application/Info/ThirdParty';

const APPLICATION_CONTRIBUTION_ENDPOINT = {
  method: 'POST',
  path: '/application-contributions',
  auth: true,
};

function ApplicationInfo({
  auth, entity, isAuthenticated,
  isFetching, match, t,
}) {
  const [isOpenUserContributionDialog, setOpenUserContributionDialog] = useState(false);
  const [userContributionType, setUserContributionType] = useState('');

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

  const userId = useMemo(
    () => ((auth.profile) ? auth.profile.id : null),
    [auth],
  );

  const onUserContribute = useCallback(
    (dpoEmail, link) => API.use(APPLICATION_CONTRIBUTION_ENDPOINT)
      .build(null, {
        user_id: userId,
        dpo_email: dpoEmail,
        link,
        application_id: entity.id,
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
    [
      userId,
      entity.id,
      closeUserContributionDialog,
      t,
      enqueueSnackbar,
    ],
  );

  return (
    <Container className="container" maxWidth="md">
      <UserContributionDialog
        open={isOpenUserContributionDialog}
        onClose={closeUserContributionDialog}
        onSuccess={onUserContribute}
        userContributionType={userContributionType}
        appName={entity.name}
      />

      <ApplicationHeader
        {...entity}
        auth={auth}
        isAuthenticated={isAuthenticated}
        isLoading={isFetching}
        onContributionDpoEmailClick={onContributionDpoEmailClick}
      />
      {!entity.unknown && (
        <ApplicationNavTabs mainDomain={entity.mainDomain} />
      )}

      <Switch>
        {!window.env.PLUGIN && (
          <PrivateRoute
            exact
            path={routes.citizen.application.personalData}
            component={ApplicationBox}
          />
        )}
        {window.env.PLUGIN && (
          <Route
            exact
            path={routes.citizen.application.thirdParty}
            render={(routerProps) => <ThirdParty entity={entity} {...routerProps} />}
          />
        )}
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
              onContributionLinkClick={onContributionLinkClick}
            />
          )}
        />
      </Switch>
    </Container>
  );
}

ApplicationInfo.propTypes = {
  auth: PropTypes.shape({ id: PropTypes.string, profile: PropTypes.object }).isRequired,
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
  entity: {},
};

export default connect((state) => ({
  auth: state.auth,
  isAuthenticated: !!state.auth.token,
}))(withTranslation(['screens'])(ApplicationInfo));
