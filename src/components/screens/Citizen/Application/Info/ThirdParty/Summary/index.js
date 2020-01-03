import React, { useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import className from 'clsx';

import orderBy from '@misakey/helpers/orderBy';
import getNextSearch from 'helpers/getNextSearch';
import isNil from '@misakey/helpers/isNil';

import { setDetectedTrackers } from 'store/actions/screens/thirdparty';

import TrackersSchema from 'store/schemas/Trackers';

import { sendMessage, listenForBackground, stopListenerForBackground } from 'background';
import { GET_BLOCKED_INFOS, REFRESH_BLOCKED_INFOS, RESTART_BG } from 'background/messages';
import { storeLinks } from 'constants/plugin';
import { openInNewTab } from 'helpers/plugin';
import { isChrome } from 'helpers/devices';

import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';

import BoxMessage from 'components/dumb/Box/Message';
import Card from 'components/dumb/Card';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

import routes from 'routes';

const LINK_TO_STORE = isChrome() ? storeLinks.chrome : storeLinks.firefox;

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
    cursor: 'pointer',
  },
  listItemEmpty: {
    textAlign: 'center',
  },
  arrowIcon: {
    marginLeft: '1rem',
  },
}));


const useFormatDetectedTrackers = () => useCallback((trackers, sort = false) => {
  const formattedTrackers = trackers.map((tracker) => {
    const { apps } = tracker;
    const blockedApps = apps.filter(((app) => app.blocked));
    return {
      ...tracker,
      blockedApps,
      isWhitelisted: blockedApps.length !== apps.length,
    };
  });
  return sort ? orderBy(formattedTrackers, ['isWhitelisted', 'name'], ['desc', 'asc']) : formattedTrackers;
}, []);

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
  detectedTrackers,
  entity,
  history,
  location: { search },
  t,
}) {
  const classes = useStyles();
  const [isFetching, setFetching] = React.useState(false);
  const [error, setError] = React.useState(false);
  const { mainDomain } = useMemo(() => (entity || { mainDomain: '' }), [entity]);
  const empty = useMemo(() => detectedTrackers.length === 0, [detectedTrackers]);

  const formatDetectedTrackers = useFormatDetectedTrackers();
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
        })
        .catch((err) => {
          if (err.message === 'not_launched') {
            setError(true);
          }
        })
        .finally(() => { setFetching(false); });
    }

    listenForBackground(listenForBackgroundCb);

    return () => { stopListenerForBackground(listenForBackgroundCb); };
  }

  const setupAction = useCallback((purpose) => {
    const nextParams = new Map([['mainDomain', mainDomain]]);
    if (!isNil(purpose)) {
      nextParams.set('mainPurpose', purpose);
    }

    const query = getNextSearch(search, nextParams);
    history.push({
      pathname: routes.account.thirdParty.setup,
      search: query,
    });
  }, [history, mainDomain, search]);

  useEffect(getData, []);

  if (error) {
    return (
      <Card
        my={2}
        title={t('screens:application.thirdParty.summary.title')}
        primary={{ onClick: () => sendMessage(RESTART_BG), text: t('screens:application.thirdParty.error.button.restart'), variant: 'contained' }}
        secondary={{ onClick: () => openInNewTab(LINK_TO_STORE), text: t('screens:application.thirdParty.error.button.update') }}
      >
        <BoxMessage type="error" text={t('screens:application.thirdParty.error.description')} />
      </Card>
    );
  }

  return (
    <Card
      my={2}
      title={t('screens:application.thirdParty.summary.title')}
      subtitle={t('screens:application.thirdParty.summary.description')}
    >
      <CardContent className={classes.content}>
        <List aria-labelledby="list-apps">
          {
            empty && (
              <ListItem className={classes.listItem}>
                <ListItemText
                  primary={
                    isFetching
                      ? <Skeleton variant="text" style={{ margin: 0 }} />
                      : t('screens:application.thirdParty.summary.count.empty')
                  }
                  className={classes.listItemEmpty}
                  onClick={() => setupAction()}
                />
              </ListItem>
            )
          }
          {
            formattedDetectedTrackers.map(({ name, apps, blockedApps }) => (
              <ListItem
                key={name}
                className={className(classes.listItem)}
                onClick={() => setupAction(name)}
              >
                <ListItemText
                  id={`switch-list-label-${name}`}
                  primary={t(`screens:application.thirdParty.purposes.${name}`)}
                />

                <Typography variant="caption">
                  {
                  `${t('screens:application.thirdParty.summary.count.blocked', { count: blockedApps.length })} 
                   /
                   ${t('screens:application.thirdParty.summary.count.detected', { count: apps.length })}`
                  }
                </Typography>
                <KeyboardArrowRight className={classes.arrowIcon} />

              </ListItem>
            ))
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
  dispatchDetectedTrackers: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
  t: PropTypes.func.isRequired,
};

ThirdPartyBlock.defaultProps = {
  entity: null,
};


// CONNECT
const mapStateToProps = (state) => ({
  detectedTrackers: state.screens.thirdparty.detectedTrackers,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchDetectedTrackers: (data) => dispatch(setDetectedTrackers(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['screens'])(ThirdPartyBlock));
