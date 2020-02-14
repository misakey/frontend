// eslint-disable-next-line no-redeclare
/* global browser */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { pluginRefreshWarningHide } from 'store/actions/warning';

import useFetchCallback from '@misakey/hooks/useFetch/callback';

import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.grey[50],
    padding: theme.spacing(1),
  },
  padding: {
    padding: theme.spacing(1),
  },
}));

const useRefreshTab = (dispatchHideWarning) => useCallback(() => {
  dispatchHideWarning();
  return browser.tabs.reload({ bypassCache: true });
}, [dispatchHideWarning]);

// COMPONENTS
const WarningDrawer = ({ displayWarning, dispatchHideWarning, t }) => {
  const classes = useStyles();
  const refreshTab = useRefreshTab(dispatchHideWarning);

  const { isFetching, wrappedFetch: onRefreshTab } = useFetchCallback(refreshTab);

  return (
    <Drawer
      variant="persistent"
      anchor="bottom"
      classes={{ paper: classes.root }}
      open={displayWarning}
    >
      <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
        <IconButton className={classes.padding} size="small" onClick={dispatchHideWarning}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
        <Typography variant="caption" style={{ width: '70%' }}>
          {t('plugin:refresh_warning.text')}
        </Typography>
        <Tooltip title={t('plugin:refresh_warning.tooltip')} placement="bottom">
          <Button
            standing={BUTTON_STANDINGS.MAIN}
            size="small"
            onClick={onRefreshTab}
            isLoading={isFetching}
            text={t('plugin:refresh_warning.button')}
          />
        </Tooltip>
      </Box>
    </Drawer>
  );
};

WarningDrawer.propTypes = {
  t: PropTypes.func.isRequired,
  displayWarning: PropTypes.bool.isRequired,
  dispatchHideWarning: PropTypes.func.isRequired,
};


// CONNECT

const mapStateToProps = (state) => ({
  displayWarning: state.warning.displayPluginRefreshWarning,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchHideWarning: () => dispatch(pluginRefreshWarningHide()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['plugin'])(WarningDrawer));
