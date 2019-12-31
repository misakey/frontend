import React, { useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { Trans, withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { denormalize } from 'normalizr';

import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';

import isEmpty from '@misakey/helpers/isEmpty';
import getSearchParams from '@misakey/helpers/getSearchParams';
import getNextSearch from 'helpers/getNextSearch';

import ApplicationSchema from 'store/schemas/Application';
import { setWhitelist, setApps } from 'store/actions/screens/thirdparty';
import { pluginRefreshWarningShow } from 'store/actions/warning';

import TrackerList from 'components/dumb/Application/ThirdParty/Setup/List';
import SplashScreen from 'components/dumb/SplashScreen';
import ElevationScroll from 'components/dumb/ElevationScroll';
import ThirdPartySearchBar from 'components/dumb/Application/ThirdParty/Setup/SearchBar';
import FilterAction from 'components/dumb/Application/ThirdParty/Setup/FilterAction';
import Switch from 'components/dumb/Switch';
import Screen, { getStyleForContainerScroll } from 'components/dumb/Screen';

import { sendMessage } from 'background';
import { UPDATE_WHITELIST, GET_APPS, GET_WHITELIST } from 'background/messages';

const PURPOSES_FILTER_HEIGHT = 38;

// STYLES
const useStyles = makeStyles((theme) => ({
  labelSmall: {
    padding: '5px',
  },
  button: {
    textTransform: 'none',
    margin: '1rem',
  },
  chip: {
    margin: '7px 4px',
  },
  trackerList: {
    ...getStyleForContainerScroll(theme, PURPOSES_FILTER_HEIGHT, { gutters: false }),
    '@media screen and (max-width: 410px)': getStyleForContainerScroll(theme, PURPOSES_FILTER_HEIGHT * 2, { gutters: false }, ['main']),
  },
}));

const useUpdateWhitelist = (
  dispatchWhitelist,
  dispatchShowWarning,
  whitelistedDomains,
) => useCallback((action, domain) => {
  const newWhitelist = action === 'add' ? [...whitelistedDomains, domain] : whitelistedDomains.filter((val) => val !== domain);
  sendMessage(UPDATE_WHITELIST, { whitelistedDomains: newWhitelist }).then((response) => {
    dispatchWhitelist(response);
    dispatchShowWarning();
  });
}, [whitelistedDomains, dispatchWhitelist, dispatchShowWarning]);

const useSetParams = (location, history) => useCallback((search, mainPurpose, mainDomain) => {
  const nextParams = [];
  if (!isEmpty(search)) {
    nextParams.push(['search', search]);
  }

  if (!isEmpty(mainPurpose)) {
    nextParams.push(['mainPurpose', mainPurpose]);
  }

  if (!isEmpty(mainDomain)) {
    nextParams.push(['mainDomain', mainDomain]);
  }

  const query = getNextSearch('', new Map(nextParams));
  const nextLocation = isEmpty(query) ? location.pathname : `${location.pathname}?${query}`;
  history.replace(nextLocation);
}, [location, history]);

function ThirdPartySetup({
  entity,
  dispatchApps,
  dispatchWhitelist,
  dispatchShowWarning,
  apps: { whitelisted, blocked },
  location,
  history,
  whitelistedDomains,
  t,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  const [isFetching, setIsFetching] = React.useState(false);
  const [trackerListRef, setTrackerListRef] = React.useState(undefined);

  const { search, mainPurpose, mainDomain } = getSearchParams(location.search);
  const setParams = useSetParams(location, history);
  const updateWhitelist = useUpdateWhitelist(
    dispatchWhitelist,
    dispatchShowWarning,
    whitelistedDomains,
  );
  const removeMainPurpose = useCallback(
    () => setParams(search, null, mainDomain), [mainDomain, search, setParams],
  );
  const removeMainDomain = useCallback(
    () => setParams(search, mainPurpose, null), [mainPurpose, search, setParams],
  );
  const listSecondaryAction = useCallback((application) => {
    const isWhitelisted = whitelistedDomains.includes(application.mainDomain);
    const onChange = () => updateWhitelist(isWhitelisted ? 'remove' : 'add', application.mainDomain);
    return <Switch checked={isWhitelisted} onChange={onChange} value={application.id} />;
  }, [updateWhitelist, whitelistedDomains]);

  const searchParams = useMemo(() => ({
    search,
    mainPurpose,
    getAllThirdParties: isEmpty(mainDomain),
  }), [search, mainPurpose, mainDomain]);

  const getWhitelist = useCallback(() => {
    sendMessage(GET_WHITELIST)
      .then((response) => {
        dispatchWhitelist(response);
      });
  }, [dispatchWhitelist]);

  const appBarProps = useMemo(
    () => ({
      withUser: false,
      items: [(
        <ThirdPartySearchBar
          onIconClick={history.goBack}
          location={location}
          entity={isEmpty(entity) ? null : entity}
          onSearch={(s) => { setParams(s, mainPurpose, mainDomain); }}
          onFiltersChange={(purpose) => { setParams(search, purpose, mainDomain); }}
          onFetching={(value) => setIsFetching(value)}
          key="thirdPartySearchBar"
        />
      )],
    }),
    [entity, history, location, mainDomain, mainPurpose, search, setParams],
  );

  useEffect(getWhitelist, []);
  useEffect(() => {
    sendMessage(GET_APPS, searchParams)
      .then((response) => {
        dispatchApps(response);
      })
      .catch(() => { enqueueSnackbar(t('httpStatus.error.default'), { variant: 'error' }); });
  }, [dispatchApps, enqueueSnackbar, searchParams, t]);

  return (
    <Screen appBarProps={appBarProps} disableGutters>
      <ElevationScroll target={trackerListRef}>
        <Paper>
          <Box display="flex" justifyContent="center" flexWrap="wrap">
            {['advertising', 'analytics', 'social_interaction', 'personalization', 'other'].map((purpose) => (
              <Chip
                key={purpose}
                classes={{ labelSmall: classes.labelSmall, root: classes.chip }}
                label={t(`screens:application.thirdParty.purposes.${purpose}`)}
                color={mainPurpose === purpose ? 'secondary' : 'primary'}
                onClick={() => (mainPurpose === purpose
                  ? setParams(search, null, mainDomain)
                  : setParams(search, purpose, mainDomain))}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      </ElevationScroll>

      <Box className={classes.trackerList} ref={(ref) => setTrackerListRef(ref)}>
        {!isFetching && (
          <>
            {whitelisted.length > 0 && (
              <TrackerList
                title={t('screens:application.thirdParty.categories.whitelisted')}
                entities={whitelisted}
                secondaryAction={listSecondaryAction}
              />
            )}

            {blocked.length > 0 && (
              <TrackerList
                title={t('screens:application.thirdParty.categories.blocked')}
                entities={blocked}
                secondaryAction={listSecondaryAction}
              />
            )}
            {mainPurpose && (
              <FilterAction
                description={(
                  <Trans i18nKey="screens:application.thirdParty.filters.mainPurpose.remove.text">
                      La liste des services tiers utilisés par
                    <b>{{ mainDomain: entity.name }}</b>
                      pour la catégorie
                    <b>{{ mainPurpose: t(`screens:application.thirdParty.purposes.${mainPurpose}`) }}</b>
                      est terminée
                  </Trans>
                )}
                buttonProps={{
                  text: t('screens:application.thirdParty.filters.mainPurpose.remove.button'),
                  action: removeMainPurpose,
                }}
              />
            )}

            {!mainPurpose && mainDomain && (
              <FilterAction
                description={(
                  <Trans i18nKey="screens:application.thirdParty.filters.mainDomain.remove.text">
                    La liste des services tiers utilisés par
                    <b>{{ mainDomain: entity.name }}</b>
                    est terminée
                  </Trans>
                )}
                buttonProps={{
                  text: t('screens:application.thirdParty.filters.mainDomain.remove.button'),
                  action: removeMainDomain,
                }}
              />
            )}

            {!mainPurpose && !mainDomain && (
              <FilterAction
                description={(
                  <Trans i18nKey="screens:application.thirdParty.filters.empty">
                    La liste des services tiers connus par
                    <b>Misakey</b>
                    est terminée
                  </Trans>
              )}
              />
            )}
          </>
        )}

        {isFetching && <SplashScreen />}
      </Box>
    </Screen>
  );
}

ThirdPartySetup.propTypes = {
  entity: PropTypes.object,
  dispatchApps: PropTypes.func.isRequired,
  dispatchWhitelist: PropTypes.func.isRequired,
  dispatchShowWarning: PropTypes.func.isRequired,
  apps: PropTypes.shape({
    blocked: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
    whitelisted: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  }),
  history: PropTypes.object.isRequired,
  location: PropTypes.shape({ search: PropTypes.string, pathname: PropTypes.string }).isRequired,
  whitelistedDomains: PropTypes.arrayOf(PropTypes.string),
  t: PropTypes.func.isRequired,
};

ThirdPartySetup.defaultProps = {
  apps: [],
  whitelistedDomains: [],
  entity: {},
};

// CONNECT
const mapStateToProps = (state, ownProps) => {
  const params = getSearchParams(ownProps.location.search);
  return {
    apps: state.screens.thirdparty.apps,
    whitelistedDomains: state.screens.thirdparty.whitelistedDomains,
    entity: denormalize(
      params.mainDomain,
      ApplicationSchema.entity,
      state.entities,
    ),
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatchApps: (data) => dispatch(setApps(data)),
  dispatchWhitelist: (data) => dispatch(setWhitelist(data)),
  dispatchShowWarning: () => dispatch(pluginRefreshWarningShow()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['common', 'screens'])(ThirdPartySetup));
