import { React, useMemo, useState, useCallback, useLayoutEffect } from 'react';

import isNil from '@misakey/helpers/isNil';
import { getVersionBuilder } from '@misakey/helpers/builder/generic';
// import simulateNetworkError from '@misakey/api/helpers/simulateNetworkError';
import exponentialBackoff from '@misakey/helpers/exponentialBackoff';

import { useOfflineContext } from 'components/smart/Context/Offline';
import { useTranslation, Trans } from 'react-i18next';
import useCountDown from '@misakey/hooks/useCountDown';
import usePrevPropEffect from '@misakey/hooks/usePrevPropEffect';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import Alert from '@material-ui/lab/Alert';
import Grid from '@material-ui/core/Grid';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// CONSTANTS
const PING_DELAY = 10; // 10sec

// HOOKS
const useStyles = makeStyles((theme) => ({
  alertRoot: {
    borderRadius: 0,
  },
  break: {
    overflowWrap: 'break-word',
  },
  noBreak: {
    whiteSpace: 'nowrap',
  },
  boldSpan: {
    fontWeight: theme.typography.fontWeightBold,
    [theme.breakpoints.up('sm')]: {
      marginRight: theme.spacing(1),
    },
  },
}));

// COMPONENTS
const OfflineAlert = (props) => {
  const classes = useStyles();

  const [attempt, setAttempt] = useState(1);
  const [pinging, setPinging] = useState(false);

  const exponentialPingDelay = useMemo(
    () => exponentialBackoff(attempt, PING_DELAY),
    [attempt],
  );

  const [countdown, { start, reset }] = useCountDown(exponentialPingDelay);
  const countdownText = useMemo(
    () => (countdown === 0 ? countdown : countdown / 1000),
    [countdown],
  );

  const { offlineError } = useOfflineContext();

  const { t } = useTranslation(['components', 'common']);

  const pingServer = useCallback(
    () => getVersionBuilder(),
    [],
  );

  const onEnd = useCallback(
    async () => {
      setPinging(true);
      reset();
      try {
        await pingServer();
        window.location.reload();
      } catch (e) {
        setAttempt((prevAttempt) => prevAttempt + 1);
        start();
        // ignore
      } finally {
        setPinging(false);
      }
    },
    [pingServer, setPinging, setAttempt, start, reset],
  );

  useLayoutEffect(
    () => {
      if (!isNil(offlineError)) {
        start();
      }
    },
    [offlineError, start],
  );

  usePrevPropEffect(countdown,
    (prevCountdown, nextCountdown) => {
      if (!pinging && prevCountdown !== 0 && nextCountdown === 0) {
        onEnd();
      }
    },
    [onEnd, pinging]);

  if (isNil(offlineError)) {
    return null;
  }

  return (
    <Box
      classes={{ root: classes.alertRoot }}
      component={Alert}
      severity="error"
      alignItems="center"
      action={(
        <Button
          standing={BUTTON_STANDINGS.TEXT}
          isLoading={pinging}
          onClick={onEnd}
          text={t('common:refresh')}
          color="inherit"
        />
      )}
      {...props}
    >
      {pinging ? (
        <Trans i18nKey="components:offline.loading">
          <span className={classes.boldSpan}>Connecting...</span>
        </Trans>
      )
        : (
          <Grid component={Trans} container i18nKey="components:offline.alert" values={{ countdown: countdownText }}>
            <Grid component="span" item xs={12} sm="auto" className={classes.boldSpan}>Connection lost.</Grid>
            <Grid component="span" item xs={12} sm="auto">Connecting in</Grid>
          </Grid>
        )}
    </Box>
  );
};

OfflineAlert.propTypes = {
};

export default OfflineAlert;
