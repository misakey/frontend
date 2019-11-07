import React, { useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';

import orderBy from '@misakey/helpers/orderBy';
import get from '@misakey/helpers/get';
import set from '@misakey/helpers/set';

import { setDetectedTrackers, setWhitelist } from 'store/actions/screens/thirdparty';
import { layoutWarningDrawerShow } from 'store/actions/Layout';

import TrackersSchema from 'store/schemas/Trackers';
import TrackersWhitelistSchema from 'store/schemas/TrackersWhitelist';

import { sendMessage, listenForBackground, stopListenerForBackground } from 'background';
import { GET_BLOCKED_INFOS, REFRESH_BLOCKED_INFOS, UPDATE_WHITELIST } from 'background/messages';

import { Typography, Grid } from '@material-ui/core';
import ThirdPartyBlockPurpose from 'components/dumb/Application/ThirdParty';

import routes from 'routes';

const useStyles = makeStyles((theme) => ({
  block: {
    padding: theme.spacing(1),
  },
  empty: {
    height: '30vh',
    border: `1px solid ${theme.palette.grey[400]}`,
    margin: '1.5rem',
    borderRadius: '10px',
  },
}));

// @TODO add to js-common helpers
function isWhitelisted(whitelist = {}, initiatorDomain, mainPurpose, target = null) {
  const globalWhitelist = whitelist.apps || [];

  if (target) {
    return globalWhitelist.includes(target);
  }

  // Check if purpose has been accepted
  const domainWhitelist = get(whitelist, ['mainPurposes', initiatorDomain], []);
  return domainWhitelist.includes(mainPurpose);
}

const useFormatDetectedTrackers = (
  whitelist,
  initiatorDomain,
) => useCallback((trackers, sort = false) => {
  const formattedTrackers = trackers.map(({ name: mainPurpose, apps }) => {
    const formattedApps = apps.map((app) => ({
      ...app,
      whitelisted: isWhitelisted(whitelist, initiatorDomain, mainPurpose, app.domain),
    }));
    return {
      name: mainPurpose,
      apps: orderBy(formattedApps, ['whitelisted', 'name'], ['desc', 'asc']),
      whitelisted: isWhitelisted(whitelist, initiatorDomain, mainPurpose),
    };
  });
  return sort ? orderBy(formattedTrackers, ['whitelisted', 'name'], ['desc', 'asc']) : formattedTrackers;
}, [whitelist, initiatorDomain]);

const useUpdateWhitelist = (
  dispatchWhitelist,
  dispatchShowWarning,
  whitelist,
  mainDomain,
) => useCallback((action, purpose) => {
  const domainWhitelist = get(whitelist, ['mainPurposes', mainDomain], []);
  const newWhitelist = { ...whitelist };
  const newValue = action === 'add' ? [...domainWhitelist, purpose] : domainWhitelist.filter((val) => val !== purpose);
  set(newWhitelist, ['mainPurposes', mainDomain], newValue);

  sendMessage(UPDATE_WHITELIST, { whitelist: newWhitelist }).then((response) => {
    dispatchWhitelist(response.whitelist);
    dispatchShowWarning();
  });
}, [dispatchWhitelist, dispatchShowWarning, whitelist, mainDomain]);

const useListenForBackgroundCb = (
  formatDetectedTrackers,
  dispatchDetectedTrackers,
) => useCallback((msg) => {
  if (msg.action === REFRESH_BLOCKED_INFOS) {
    const sorted = formatDetectedTrackers(msg.detectedTrackers, true);
    dispatchDetectedTrackers(sorted || []);
  }
}, [formatDetectedTrackers, dispatchDetectedTrackers]);

function ThirdPartyBlock({
  dispatchDetectedTrackers,
  dispatchWhitelist,
  dispatchShowWarning,
  detectedTrackers,
  entity,
  history,
  t,
  whitelist,
}) {
  const classes = useStyles();
  const [isFetching, setFetching] = React.useState(false);
  const mainDomain = useMemo(() => entity.mainDomain, [entity]);
  const empty = useMemo(() => detectedTrackers.length === 0, [detectedTrackers]);

  const formatDetectedTrackers = useFormatDetectedTrackers(whitelist, mainDomain);
  const listenForBackgroundCb = useListenForBackgroundCb(
    formatDetectedTrackers,
    dispatchDetectedTrackers,
  );

  const formattedDetectedTrackers = useMemo(
    () => (formatDetectedTrackers(detectedTrackers)),
    [detectedTrackers, formatDetectedTrackers],
  );

  function getData() {
    if (!isFetching) {
      setFetching(true);
      sendMessage(GET_BLOCKED_INFOS)
        .then((response) => {
          const sorted = formatDetectedTrackers(response.detectedTrackers, true);
          dispatchDetectedTrackers(sorted || []);
          dispatchWhitelist(response.whitelist || {});
          setFetching(false);
        });
    }

    listenForBackground(listenForBackgroundCb);

    return () => { stopListenerForBackground(listenForBackgroundCb); };
  }

  const updateWhitelist = useUpdateWhitelist(
    dispatchWhitelist,
    dispatchShowWarning,
    whitelist,
    mainDomain,
  );

  useEffect(getData, []);

  return (
    <Grid
      container
      justify="center"
      alignItems={empty ? 'center' : 'flex-start'}
    >
      {
        formattedDetectedTrackers.map(({ name, apps, whitelisted }) => (
          <Grid
            item
            xs={12}
            className={classes.block}
            key={name}
          >
            <ThirdPartyBlockPurpose
              entity={entity}
              mainPurpose={{ name, whitelisted }}
              apps={apps}
              addToWhitelist={() => updateWhitelist('add', name)}
              removeFromWhitelist={() => updateWhitelist('remove', name)}
              setupAction={() => {
                const query = new URLSearchParams();
                query.set('mainPurpose', name);
                query.set('mainDomain', mainDomain);
                history.push({
                  pathname: routes.account.thirdParty.setup,
                  search: query.toString(),
                });
              }}
            />
          </Grid>
        ))
      }
      {empty && !isFetching && (
        <Grid
          container
          className={classes.empty}
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Typography>{t('screens:application.thirdParty.trackers.empty')}</Typography>
        </Grid>
      )}

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
  dispatchShowWarning: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

ThirdPartyBlock.defaultProps = {
  entity: {},
};


// CONNECT
const mapStateToProps = (state) => ({
  detectedTrackers: state.screens.thirdparty.detectedTrackers,
  whitelist: state.screens.thirdparty.whitelist,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchWhitelist: (data) => dispatch(setWhitelist(data)),
  dispatchDetectedTrackers: (data) => dispatch(setDetectedTrackers(data)),
  dispatchShowWarning: () => dispatch(layoutWarningDrawerShow()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['screens'])(ThirdPartyBlock));
