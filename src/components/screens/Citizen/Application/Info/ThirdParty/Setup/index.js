import React, { useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { Trans, withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { denormalize } from 'normalizr';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';

import isEmpty from '@misakey/helpers/isEmpty';
import getSearchParams from '@misakey/helpers/getSearchParams';
import groupBy from '@misakey/helpers/groupBy';

import ApplicationSchema from 'store/schemas/Application';
import TrackersWhitelistSchema from 'store/schemas/TrackersWhitelist';
import { setWhitelist, setApps, toggleWhitelistForApp } from 'store/actions/screens/thirdparty';
import { layoutAppbarHide, layoutAppbarShow, layoutWarningDrawerShow } from 'store/actions/Layout';

import TrackerList from 'components/dumb/Application/ThirdParty/Setup/List';

import SplashScreen from '@misakey/ui/SplashScreen';
import ThirdPartySearchBar from 'components/dumb/Application/ThirdParty/Setup/SearchBar';
import Switch from 'components/dumb/Switch';

import { sendMessage } from 'background';
import { UPDATE_WHITELIST, GET_APPS } from 'background/messages';
import './Setup.scss';

// STYLES
const useStyles = makeStyles((theme) => ({
  labelSmall: {
    padding: '5px',
  },
  bottomAction: {
    padding: '1rem',
    textAlign: 'center',
  },
  button: {
    textTransform: 'none',
  },
  typography: {
    color: theme.palette.grey[400],
  },
}));

// HELPERS

const useFormatApps = (whitelist) => useCallback(
  (apps) => apps.map((app) => ({
    ...app,
    whitelisted: (whitelist.apps || []).includes(app.mainDomain),
  })),
  [whitelist],
);

const useUpdateWhitelist = (
  dispatchWhitelist,
  dispatchToggleWhitelistForApp,
  dispatchShowWarning,
  whitelist,
) => useCallback((action, domain, listKey) => {
  const appsWhitelist = whitelist.apps || [];
  const newWhitelist = {
    ...whitelist,
    apps: action === 'add' ? [...appsWhitelist, domain] : appsWhitelist.filter((val) => val !== domain),
  };

  sendMessage(UPDATE_WHITELIST, { whitelist: newWhitelist }).then((response) => {
    dispatchWhitelist(response.whitelist);
    dispatchToggleWhitelistForApp(domain, listKey);
    dispatchShowWarning();
  });
}, [dispatchWhitelist, dispatchToggleWhitelistForApp, dispatchShowWarning, whitelist]);

const useSetParams = (location, history) => useCallback((search, mainPurpose, mainDomain) => {
  const nextParams = new URLSearchParams('');

  if (!isEmpty(search)) {
    nextParams.set('search', search);
  }

  if (!isEmpty(mainPurpose)) {
    nextParams.set('mainPurpose', mainPurpose);
  }

  if (!isEmpty(mainDomain)) {
    nextParams.set('mainDomain', mainDomain);
  }

  const query = nextParams.toString();
  const nextLocation = isEmpty(query) ? location.pathname : `${location.pathname}?${query}`;
  history.replace(nextLocation);
}, [location, history]);


function ThirdPartySetup({
  appBarIsDisplayed,
  entity,
  dispatchApps,
  dispatchWhitelist,
  dispatchToggleWhitelistForApp,
  dispatchLayoutAppbarShow,
  dispatchLayoutAppbarHide,
  dispatchShowWarning,
  whitelistedApps,
  blockedApps,
  location,
  history,
  whitelist,
  t,
}) {
  const [isFetching, setFetching] = React.useState(false);
  const { search, mainPurpose, mainDomain } = getSearchParams(location.search);
  const { enqueueSnackbar } = useSnackbar();
  const formatApps = useFormatApps(whitelist);
  const classes = useStyles();

  const getData = (s = search) => {
    if (!isFetching) {
      setFetching(true);

      sendMessage(GET_APPS, {
        search: s,
        mainPurpose,
        getAllThirdParties: isEmpty(mainDomain),
      })
        .then((response) => {
          const { whitelisted, blocked } = groupBy(formatApps(response.apps), (app) => (app.whitelisted ? 'whitelisted' : 'blocked'));
          dispatchApps({ whitelisted: whitelisted || [], blocked: blocked || [] });
          setFetching(false);
        })
        .catch(() => {
          const text = t('httpStatus.error.default');
          enqueueSnackbar(text, { variant: 'error' });
        })
        .finally(() => {
          setFetching(false);
        });
    }
  };

  const onGoBack = useCallback(() => {
    setFetching(true);
    dispatchLayoutAppbarShow();
    history.goBack();
  }, [setFetching, dispatchLayoutAppbarShow, history]);

  const appBarDisplayRef = useRef();
  appBarDisplayRef.current = appBarIsDisplayed;

  useEffect(getData, [search, mainPurpose, mainDomain]);
  useEffect(() => {
    if (appBarDisplayRef.current) {
      dispatchLayoutAppbarHide();
      return () => { dispatchLayoutAppbarShow(); };
    }
    return undefined;
  }, [appBarDisplayRef, dispatchLayoutAppbarHide, dispatchLayoutAppbarShow]);

  const setParams = useSetParams(location, history);
  const updateWhitelist = useUpdateWhitelist(
    dispatchWhitelist,
    dispatchToggleWhitelistForApp,
    dispatchShowWarning,
    whitelist,
  );

  return (
    <div className="main">
      <ThirdPartySearchBar
        onIconClick={onGoBack}
        location={location}
        entity={isEmpty(entity) ? null : entity}
        onSearch={(s) => { setParams(s, mainPurpose, mainDomain); }}
        onFiltersChange={(purpose) => { setParams(search, purpose, mainDomain); }}
        onFetching={(value) => setFetching(value)}
      />
      <div className="purposeChipFilters">
        {['advertising', 'analytics', 'social_interaction', 'personalization', 'other'].map((purpose) => (
          <Chip
            key={purpose}
            classes={{ labelSmall: classes.labelSmall }}
            label={t(`screens:application.thirdParty.purposes.${purpose}`)}
            color={mainPurpose === purpose ? 'secondary' : 'primary'}
            onClick={() => (mainPurpose === purpose
              ? setParams(search, null, mainDomain)
              : setParams(search, purpose, mainDomain))}
            size="small"
            variant="outlined"
          />
        ))}
      </div>

      <nav className={clsx('trackerList', { 'prevent-scroll': isFetching })}>
        {!isFetching && (
          <>
            {whitelistedApps && whitelistedApps.length > 0 && (
              <TrackerList
                title={t('screens:application.thirdParty.categories.whitelisted')}
                entities={whitelistedApps}
                secondaryAction={(application) => (
                  <Switch
                    checked={application.whitelisted}
                    onChange={
                      () => updateWhitelist(
                        application.whitelisted ? 'remove' : 'add',
                        application.mainDomain,
                        'whitelisted',
                      )
                    }
                    value={application.id}
                  />
                )}
              />
            )}

            {blockedApps && blockedApps.length > 0 && (
              <TrackerList
                title={t('screens:application.thirdParty.categories.blocked')}
                entities={blockedApps}
                secondaryAction={(application) => (
                  <Switch
                    checked={application.whitelisted}
                    onChange={
                      () => updateWhitelist(
                        application.whitelisted ? 'remove' : 'add',
                        application.mainDomain,
                        'blocked',
                      )
                    }
                    value={application.id}
                  />
                )}
              />
            )}
            {mainPurpose && (
              <Grid className={classes.bottomAction} container direction="column" justify="center" alignItems="center" spacing={2}>
                <Grid item>
                  <Typography variant="body2" className={classes.typography}>
                    <Trans i18nKey="screens:application.thirdParty.filters.mainPurpose.remove.text">
                      La liste des services tiers utilisés par
                      <b>{{ mainDomain: entity.name }}</b>
                      pour la catégorie
                      <b>{{ mainPurpose: t(`screens:application.thirdParty.purposes.${mainPurpose}`) }}</b>
                      est terminée
                    </Trans>
                  </Typography>
                </Grid>
                <Grid item>
                  <Button
                    className={classes.button}
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => { setParams(search, null, mainDomain); }}
                  >
                    {t('screens:application.thirdParty.filters.mainPurpose.remove.button')}
                  </Button>
                </Grid>
              </Grid>
            )}

            {!mainPurpose && mainDomain && (
              <Grid className={classes.bottomAction} container direction="column" justify="center" alignItems="center" spacing={2}>
                <Grid item>
                  <Typography variant="body2" className={classes.typography}>
                    <Trans i18nKey="screens:application.thirdParty.filters.mainDomain.remove.text">
                      La liste des services tiers utilisés par
                      <b>{{ mainDomain: entity.name }}</b>
                      est terminée
                    </Trans>
                  </Typography>
                </Grid>
                <Grid item>
                  <Button
                    className={classes.button}
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => { setParams(search, mainPurpose, null); }}
                  >
                    {t('screens:application.thirdParty.filters.mainDomain.remove.button')}
                  </Button>
                </Grid>
              </Grid>
            )}

            {!mainPurpose && !mainDomain && (
              <Grid className={classes.bottomAction} container direction="column" justify="center" alignItems="center" spacing={2}>
                <Typography variant="body2" className={classes.typography}>
                  <Trans i18nKey="screens:application.thirdParty.filters.empty">
                    La liste des services tiers connus par
                    <b>Misakey</b>
                    est terminée
                  </Trans>
                </Typography>
              </Grid>
            )}
          </>
        )}

        {isFetching && <SplashScreen />}
      </nav>
    </div>
  );
}

ThirdPartySetup.propTypes = {
  appBarIsDisplayed: PropTypes.bool.isRequired,
  entity: PropTypes.object,
  dispatchApps: PropTypes.func.isRequired,
  dispatchWhitelist: PropTypes.func.isRequired,
  dispatchToggleWhitelistForApp: PropTypes.func.isRequired,
  dispatchLayoutAppbarShow: PropTypes.func.isRequired,
  dispatchLayoutAppbarHide: PropTypes.func.isRequired,
  dispatchShowWarning: PropTypes.func.isRequired,
  whitelistedApps: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  blockedApps: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  history: PropTypes.object.isRequired,
  location: PropTypes.shape({ search: PropTypes.string, pathname: PropTypes.string }).isRequired,
  whitelist: PropTypes.shape(TrackersWhitelistSchema).isRequired,
  t: PropTypes.func.isRequired,
};

ThirdPartySetup.defaultProps = {
  whitelistedApps: [],
  blockedApps: [],
  entity: {},
};

// CONNECT
const mapStateToProps = (state, ownProps) => {
  const params = getSearchParams(ownProps.location.search);
  return {
    whitelistedApps: state.screens.thirdparty.apps.whitelisted,
    blockedApps: state.screens.thirdparty.apps.blocked,
    whitelist: state.screens.thirdparty.whitelist,
    appBarIsDisplayed: state.Layout.displayAppBar,
    entity: denormalize(
      params.mainDomain,
      ApplicationSchema.entity,
      state.entities,
    ),
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatchApps: (data) => dispatch(setApps(data)),
  dispatchToggleWhitelistForApp: (id, listKey) => {
    dispatch(toggleWhitelistForApp(id, listKey));
  },
  dispatchWhitelist: (data) => dispatch(setWhitelist(data)),
  dispatchLayoutAppbarHide: () => dispatch(layoutAppbarHide()),
  dispatchLayoutAppbarShow: () => dispatch(layoutAppbarShow()),
  dispatchShowWarning: () => dispatch(layoutWarningDrawerShow()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['common', 'screens'])(ThirdPartySetup));
