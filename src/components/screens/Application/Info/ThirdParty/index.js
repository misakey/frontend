import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';

import orderBy from '@misakey/helpers/orderBy';
import get from '@misakey/helpers/get';
import set from '@misakey/helpers/set';

import { setDetectedTrackers, setWhitelist } from 'store/actions/screens/thirdparty';
import TrackersSchema from 'store/schemas/Trackers';
import TrackersWhitelistSchema from 'store/schemas/TrackersWhitelist';

import { sendMessage, listenForBackground, stopListenerForBackground } from 'background';
import { GET_BLOCKED_INFOS, REFRESH_BLOCKED_INFOS, UPDATE_WHITELIST } from 'background/messages';

import { Typography, Grid } from '@material-ui/core';
import ThirdPartyBlockCategory from 'components/dumb/Application/ThirdParty';
import SplashScreen from 'components/dumb/SplashScreen';
import PausePluginButton from 'components/smart/PausePluginButton';

import routes from 'routes';

const useStyles = makeStyles((theme) => ({
  block: {
    padding: theme.spacing(1),
  },
}));

// @TODO add to js-common helpers
function isWhitelisted(whitelist = {}, initiatorDomain, category, target = null) {
  const globalWhitelist = whitelist.apps || [];

  if (target) {
    return globalWhitelist.includes(target);
  }

  // Check if category has been accepted
  const domainWhitelist = get(whitelist, ['categories', initiatorDomain], []);
  return domainWhitelist.includes(category);
}

function formatDetectedTrackers(trackers, whitelist, initiatorDomain, sort = false) {
  const formattedTrackers = trackers.map(({ name: category, apps }) => {
    const formattedApps = apps.map((app) => ({
      ...app,
      whitelisted: isWhitelisted(whitelist, initiatorDomain, category, app.domain),
    }));
    return {
      name: category,
      apps: orderBy(formattedApps, ['whitelisted', 'name'], ['desc', 'asc']),
      whitelisted: isWhitelisted(whitelist, initiatorDomain, category),
    };
  });
  return sort ? orderBy(formattedTrackers, ['whitelisted', 'name'], ['desc', 'asc']) : formattedTrackers;
}

function ThirdPartyBlock({
  dispatchDetectedTrackers,
  dispatchWhitelist,
  detectedTrackers,
  entity,
  history,
  mainDomain,
  t,
  whitelist,
}) {
  const classes = useStyles();
  const [isFetching, setFetching] = React.useState(false);

  const empty = React.useMemo(() => detectedTrackers.length === 0, [detectedTrackers]);
  const formattedDetectedTrackers = React.useMemo(
    () => (formatDetectedTrackers(detectedTrackers, whitelist, mainDomain)),
    [detectedTrackers, whitelist, mainDomain],
  );

  function listenForBackgroundCb(msg) {
    if (msg.action === REFRESH_BLOCKED_INFOS) {
      const sorted = formatDetectedTrackers(msg.detectedTrackers, whitelist, mainDomain, true);
      dispatchDetectedTrackers(sorted || []);
    }
  }

  function getData() {
    if (!isFetching) {
      setFetching(true);
      sendMessage(GET_BLOCKED_INFOS)
        .then((response) => {
          const sorted = formatDetectedTrackers(
            response.detectedTrackers,
            response.whitelist,
            mainDomain,
            true,
          );
          dispatchDetectedTrackers(sorted || []);
          dispatchWhitelist(response.whitelist || {});
          setFetching(false);
        });
    }

    listenForBackground(listenForBackgroundCb);

    return () => { stopListenerForBackground(listenForBackgroundCb); };
  }

  function updateWhitelist(action, category) {
    const domainWhitelist = get(whitelist, ['categories', mainDomain], []);
    const newWhitelist = { ...whitelist };
    const newValue = action === 'add' ? [...domainWhitelist, category] : domainWhitelist.filter((val) => val !== category);
    set(newWhitelist, ['categories', mainDomain], newValue);

    sendMessage(UPDATE_WHITELIST, { whitelist: newWhitelist }).then((response) => {
      dispatchWhitelist(response.whitelist);
    });
  }

  React.useEffect(getData, []);

  if (isFetching) {
    return <SplashScreen />;
  }

  return (
    <Grid
      container
      justify="center"
      alignItems={empty ? 'center' : 'flex-start'}
    >
      <Grid item xs={12} className={classes.block}>
        <PausePluginButton />
      </Grid>

      {
        formattedDetectedTrackers.map(({ name, apps, whitelisted }) => (
          <Grid
            item
            xs={12}
            className={classes.block}
            key={name}
          >
            <ThirdPartyBlockCategory
              entity={entity}
              category={{ name, whitelisted }}
              apps={apps}
              addToWhitelist={() => updateWhitelist('add', name)}
              removeFromWhitelist={() => updateWhitelist('remove', name)}
              setupAction={(search = null) => {
                const query = new URLSearchParams();
                query.set('mainPurpose', name);
                query.set('mainDomain', mainDomain);
                if (search) { query.set('search', search); }
                history.push({
                  pathname: routes.account.thirdParty.setup,
                  search: query.toString(),
                });
              }}
            />
          </Grid>
        ))
      }
      {empty && <Typography>{t('screens:application.thirdParty.trackers.empty')}</Typography>}

    </Grid>
  );
}

ThirdPartyBlock.propTypes = {
  detectedTrackers: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    whitelisted: PropTypes.bool,
    apps: PropTypes.arrayOf(PropTypes.shape(TrackersSchema)),
  })).isRequired,
  entity: PropTypes.shape({ logoUri: PropTypes.string, mainDomain: PropTypes.string }),
  whitelist: PropTypes.shape(TrackersWhitelistSchema).isRequired,
  dispatchWhitelist: PropTypes.func.isRequired,
  dispatchDetectedTrackers: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  mainDomain: PropTypes.string,
  t: PropTypes.func.isRequired,
};

ThirdPartyBlock.defaultProps = {
  entity: {},
  mainDomain: undefined,
};


// CONNECT
const mapStateToProps = (state) => ({
  detectedTrackers: state.screens.thirdparty.detectedTrackers,
  whitelist: state.screens.thirdparty.whitelist,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchWhitelist: (data) => {
    dispatch(setWhitelist(data));
  },
  dispatchDetectedTrackers: (data) => {
    dispatch(setDetectedTrackers(data));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(withTranslation(['screens'])(ThirdPartyBlock)));
