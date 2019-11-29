import React, { useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import className from 'clsx';

import orderBy from '@misakey/helpers/orderBy';
import get from '@misakey/helpers/get';
import set from '@misakey/helpers/set';

import { setDetectedTrackers, setWhitelist } from 'store/actions/screens/thirdparty';
import { layoutWarningDrawerShow } from 'store/actions/Layout';

import TrackersSchema from 'store/schemas/Trackers';
import TrackersWhitelistSchema from 'store/schemas/TrackersWhitelist';

import { sendMessage, listenForBackground, stopListenerForBackground } from 'background';
import { GET_BLOCKED_INFOS, REFRESH_BLOCKED_INFOS, UPDATE_WHITELIST } from 'background/messages';

import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';

import Card from 'components/dumb/Card';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Switch from 'components/dumb/Switch';

import routes from 'routes';

const useStyles = makeStyles((theme) => ({
  content: {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0,
    },
  },
  listItem: {
    borderTop: `1px solid ${theme.palette.grey[400]}`,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    '&.whitelisted': {
      cursor: 'pointer',
    },
    '&:not(.whitelisted)': {
      backgroundColor: theme.palette.grey[100],
      color: theme.palette.grey[700],
      opacity: 0.5,
      filter: 'grayscale(1)',
    },
  },
}));

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
      whitelisted: isWhitelisted(whitelist, initiatorDomain, mainPurpose, app.mainDomain),
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
  const { mainDomain } = useMemo(() => (entity || { mainDomain: '' }), [entity]);
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
        })
        .finally(() => { setFetching(false); });
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

  const setupAction = useCallback((name) => {
    const query = new URLSearchParams();
    query.set('mainPurpose', name);
    query.set('mainDomain', mainDomain);
    history.push({
      pathname: routes.account.thirdParty.setup,
      search: query.toString(),
    });
  }, [history, mainDomain]);

  useEffect(getData, []);

  if (empty && !isFetching) {
    return (
      <Card
        display="flex"
        minHeight="30vh"
        mt={3}
        p={2}
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        <Typography>{t('screens:application.thirdParty.trackers.empty')}</Typography>
      </Card>
    );
  }

  return (
    <Card
      mt={3}
      title={t('screens:application.thirdParty.myConfig.title')}
      subtitle={t('screens:application.thirdParty.myConfig.description')}
    >
      <CardContent
        className={className('content', classes.content)}
      >
        {empty && isFetching && (
          <List component="div" aria-labelledby="placeholder-list-apps">
            <ListItem className={classes.listItem}>
              <ListItemText
                className="text"
                primary={<Skeleton variant="text" style={{ margin: 0 }} />}
              />
            </ListItem>
          </List>
        )}
        <List component="div" aria-labelledby="list-apps">
          {
            formattedDetectedTrackers.map(({ name, apps, whitelisted }) => {
              const whitelistedApps = apps.filter(((app) => !app.blocked));
              return (
                <ListItem
                  key={name}
                  className={className(classes.listItem, { whitelisted })}
                  onClick={whitelisted ? () => setupAction(name) : null}
                >
                  <ListItemText
                    id={`switch-list-label-${name}`}
                    primary={t(`screens:application.thirdParty.purposes.${name}`)}
                  />

                  <Typography variant="body2" className={classes.typography}>
                    {`${whitelistedApps.length}/${apps.length}`}
                  </Typography>

                  <ListItemSecondaryAction>
                    <Switch
                      checked={whitelisted}
                      value={name.toString()}
                      inputProps={{ 'aria-label': 'secondary checkbox' }}
                      onChange={whitelisted ? () => updateWhitelist('remove', name) : () => updateWhitelist('add', name)}
                    />
                  </ListItemSecondaryAction>

                </ListItem>
              );
            })
          }
        </List>

      </CardContent>
    </Card>
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
  entity: null,
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
