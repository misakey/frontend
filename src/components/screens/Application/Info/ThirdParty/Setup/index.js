import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { Typography } from '@material-ui/core';

import isEmpty from '@misakey/helpers/isEmpty';
import getSearchParams from '@misakey/helpers/getSearchParams';
import orderBy from '@misakey/helpers/orderBy';

import ApplicationSchema from 'store/schemas/Application';
import TrackersWhitelistSchema from 'store/schemas/TrackersWhitelist';
import { setWhitelist, setApps } from 'store/actions/screens/thirdparty';

import ApplicationList from 'components/dumb/Application/List';
import SplashScreen from 'components/dumb/SplashScreen';
import ThirdPartySearchBar from 'components/dumb/Application/ThirdParty/Setup/SearchBar';
import Switch from 'components/dumb/Switch';

import { sendMessage } from 'background';
import { UPDATE_WHITELIST, GET_APPS } from 'background/messages';
import 'components/screens/Application/Application.scss';
import 'components/screens/Application/Info/ThirdParty/Setup/Setup.scss';

// HELPERS

const useFormatApps = (whitelist) => useCallback((apps, sort = false) => {
  const formattedApps = apps.map((app) => ({
    ...app,
    whitelisted: (whitelist.apps || []).includes(app.mainDomain),
  }));
  return sort ? orderBy(formattedApps, ['whitelisted', 'name'], ['desc', 'asc']) : formattedApps;
}, [whitelist]);

const useUpdateWhitelist = (dispatchWhitelist, whitelist) => useCallback((action, domain) => {
  const appsWhitelist = whitelist.apps || [];
  const newWhitelist = {
    ...whitelist,
    apps: action === 'add' ? [...appsWhitelist, domain] : appsWhitelist.filter((val) => val !== domain),
  };

  sendMessage(UPDATE_WHITELIST, { whitelist: newWhitelist }).then((response) => {
    dispatchWhitelist(response.whitelist);
  });
}, [dispatchWhitelist, whitelist]);

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

// COMPONENTS

const useBottomAction = (t, setParams, search, mainPurpose, mainDomain) => useCallback(() => {
  if (mainPurpose) {
    return (
      <Grid container direction="column" justify="center" alignItems="center" spacing={1}>
        <Typography variant="body2" color="textSecondary">
          {t(
            'screens:application.thirdParty.filters.mainPurpose.remove.text',
            { purpose: t(`screens:application.thirdParty.categories.${mainPurpose}`) },
          )}
        </Typography>
        <Button size="small" variant="contained" color="secondary" onClick={() => { setParams(search, null, mainDomain); }}>
          {t('screens:application.thirdParty.filters.mainPurpose.remove.button', { purpose: mainPurpose })}
        </Button>
      </Grid>
    );
  }

  if (mainDomain) {
    return (
      <Grid container direction="column" justify="center" alignItems="center" spacing={1}>
        <Typography variant="body2" color="textSecondary">
          {t('screens:application.thirdParty.filters.mainDomain.remove.text')}
        </Typography>
        <Button size="small" variant="contained" color="secondary" onClick={() => { setParams(search, mainPurpose, null); }}>
          {t('screens:application.thirdParty.filters.mainDomain.remove.button')}
        </Button>
      </Grid>
    );
  }
  return null;
}, [t, setParams, search, mainPurpose, mainDomain]);

function ThirdPartySetup({
  className,
  dispatchApps,
  dispatchWhitelist,
  apps,
  location,
  history,
  whitelist,
  t,
}) {
  const [isFetching, setFetching] = React.useState(false);
  const { search, mainPurpose, mainDomain } = getSearchParams(location.search);
  const { enqueueSnackbar } = useSnackbar();
  const formatApps = useFormatApps(whitelist);

  const getData = (s = search) => {
    if (!isFetching) {
      setFetching(true);

      sendMessage(GET_APPS, {
        search: s,
        mainPurpose,
        getAllThirdParties: isEmpty(mainDomain),
      })
        .then((response) => {
          dispatchApps(formatApps(response.apps, true) || []);
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

  useEffect(getData, [search, mainPurpose, mainDomain]);

  const setParams = useSetParams(location, history);
  const updateWhitelist = useUpdateWhitelist(dispatchWhitelist, whitelist);
  const formattedApps = formatApps(apps, false);
  const bottomAction = useBottomAction(t, setParams, search, mainPurpose, mainDomain);

  return (
    <div className={clsx('Application', className)}>
      <div className="main">
        <ThirdPartySearchBar
          onSearch={(s) => { setParams(s, mainPurpose, mainDomain); }}
          onFiltersChange={(purpose) => { setParams(search, purpose, mainDomain); }}
          onFetching={(value) => setFetching(value)}
        />
        <nav className={clsx('no-app-bar', { 'prevent-scroll': isFetching })}>
          {(
            <ApplicationList
              applications={formattedApps}
              search={location.search}
              linkTo={null}
              bottomAction={mainPurpose || mainDomain ? bottomAction : null}
              secondaryAction={(application) => (
                <Switch
                  checked={application.whitelisted}
                  onChange={
                    () => updateWhitelist(
                      application.whitelisted ? 'remove' : 'add',
                      application.mainDomain,
                      whitelist,
                      dispatchWhitelist,
                    )
                  }
                  value={application.id}
                />
              )}
            />
          )}

          {isFetching && <SplashScreen />}
        </nav>
      </div>
    </div>
  );
}

ThirdPartySetup.propTypes = {
  className: PropTypes.string,
  dispatchApps: PropTypes.func.isRequired,
  dispatchWhitelist: PropTypes.func.isRequired,
  apps: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  history: PropTypes.object.isRequired,
  location: PropTypes.shape({ search: PropTypes.string, pathname: PropTypes.string }).isRequired,
  whitelist: PropTypes.shape(TrackersWhitelistSchema).isRequired,
  t: PropTypes.func.isRequired,
};

ThirdPartySetup.defaultProps = {
  className: '',
  apps: [],
};

// CONNECT
const mapStateToProps = (state) => ({
  apps: state.screens.thirdparty.apps,
  whitelist: state.screens.thirdparty.whitelist,
});


const mapDispatchToProps = (dispatch) => ({
  dispatchApps: (data) => {
    dispatch(setApps(data));
  },
  dispatchWhitelist: (data) => {
    dispatch(setWhitelist(data));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['common', 'screens'])(ThirdPartySetup));
