import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch, generatePath } from 'react-router-dom';
import { denormalize, normalize } from 'normalizr';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import { isDesktopDevice } from 'helpers/devices';

import API from '@misakey/api';
import { receiveEntities } from '@misakey/store/actions/entities';
import ApplicationSchema from 'store/schemas/Application';

import routes from 'routes';

import ResponseHandlerWrapper from '@misakey/ui/ResponseHandlerWrapper';
import PrivateRoute from '@misakey/auth/components/Route/Private';

import ApplicationHeader from 'components/dumb/Application/Header';
import ApplicationNavTabs from 'components/screens/Application/Info/Nav';
import ApplicationBox from 'components/screens/Application/Box';
import UserContributionDialog from 'components/smart/UserContributionDialog';

import Content from './Content';
import Comments from './Comments';
import MyAccount from './MyAccount';
import ThirdParty from './ThirdParty';

const APPLICATION_CONTRIBUTION_ENDPOINT = {
  method: 'POST',
  path: '/application-contributions',
  auth: true,
};

const useScrollButtons = () => useMemo(() => window.env.PLUGIN && isDesktopDevice());

function ApplicationInfo({
  auth, dispatch, entity, history,
  isAuthenticated, mainDomain, match, t,
}) {
  const [isFetching, setFetching] = useState(false);
  const [error, setError] = useState(false);
  const [isOpenUserContributionDialog, setOpenUserContributionDialog] = useState(false);
  const [userContributionType, setUserContributionType] = useState('');

  const { enqueueSnackbar } = useSnackbar();
  const displayScrollButtons = useScrollButtons();

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

  function getData() {
    if (!isFetching && mainDomain) {
      setError(false);
      setFetching(true);

      const endpoint = API.endpoints.application.read;

      if (!isAuthenticated) { endpoint.auth = false; }

      API.use(endpoint)
        .build({ mainDomain })
        .send()
        .then((response) => {
          const normalized = normalize(objectToCamelCase(response), ApplicationSchema.entity);
          const { entities } = normalized;

          dispatch(receiveEntities(entities));
        })
        .catch(({ httpStatus }) => {
          if (window.env.PLUGIN && httpStatus === 404) {
            const defaultEntity = {
              mainDomain,
              unknown: true,
              id: mainDomain,
              name: `${mainDomain.charAt(0).toUpperCase()}${mainDomain.slice(1)}`,
            };
            dispatch(receiveEntities({ applications: { [mainDomain]: defaultEntity } }));

            history.replace(generatePath(routes.application.thirdParty, defaultEntity));
          } else { setError(httpStatus); }
        })
        .finally(() => { setFetching(false); });
    }
  }

  useEffect(getData, [mainDomain, isAuthenticated]);

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
    <section id="ApplicationInfo" className="section">
      <ResponseHandlerWrapper entity={entity} error={error} isFetching={isFetching}>
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
          hideNavigation={window.env.PLUGIN && !isAuthenticated}
          isLoading={isFetching}
          onContributionDpoEmailClick={onContributionDpoEmailClick}
        />
        {!entity.unknown && (
          <ApplicationNavTabs
            mainDomain={entity.mainDomain}
            scrollButtons={displayScrollButtons ? 'on' : 'auto'}
          />
        )}

        <Switch>
          <Route
            exact
            path={routes.application.comments}
            render={() => <Comments entity={entity} />}
          />
          {!window.env.PLUGIN && (
            <PrivateRoute
              exact
              path={routes.application.personalData}
              component={ApplicationBox}
            />
          )}
          {window.env.PLUGIN && (
            <Route
              exact
              path={routes.application.thirdParty}
              render={() => <ThirdParty entity={entity} mainDomain={mainDomain} />}
            />
          )}
          <Route
            exact
            path={routes.application.myAccount}
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
      </ResponseHandlerWrapper>

    </section>
  );
}

ApplicationInfo.propTypes = {
  auth: PropTypes.shape({ id: PropTypes.string, profile: PropTypes.object }).isRequired,
  dispatch: PropTypes.func.isRequired,
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  mainDomain: PropTypes.string.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({ mainDomain: PropTypes.string }),
    path: PropTypes.string,
  }).isRequired,
  t: PropTypes.func.isRequired,
};

ApplicationInfo.defaultProps = {
  entity: {},
};

export default connect(
  (state, ownProps) => ({
    auth: state.auth,
    entity: denormalize(
      ownProps.match.params.mainDomain,
      ApplicationSchema.entity,
      state.entities,
    ),
    isAuthenticated: !!state.auth.token,
    mainDomain: ownProps.match.params.mainDomain,
  }),
)(withTranslation(['screens'])(ApplicationInfo));
