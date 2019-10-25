// eslint-disable-next-line no-redeclare
/* global browser */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { layoutWarningDrawerHide } from 'store/actions/Layout';

import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

import 'components/screens/Plugin/DefaultScreen.scss';

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.grey[300],
    padding: theme.spacing(1),
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
  },
  padding: {
    padding: theme.spacing(1),
  },
}));

const useRefreshTab = (hideWarning) => useCallback(() => {
  browser.tabs.reload();
  hideWarning();
}, [hideWarning]);

const useHideWarning = (dispatchHideWarning) => useCallback(() => {
  dispatchHideWarning();
}, [dispatchHideWarning]);

// COMPONENTS
const WarningDrawer = ({ dispatchHideWarning, t }) => {
  const classes = useStyles();
  const hideWarning = useHideWarning(dispatchHideWarning);
  const refreshTab = useRefreshTab(hideWarning);

  return (
    <Drawer
      variant="permanent"
      anchor="bottom"
      classes={{ paper: classes.root }}
      open
    >
      <div className={classes.container}>
        <IconButton className={classes.padding} size="small" onClick={refreshTab}>
          <RefreshIcon fontSize="inherit" />
        </IconButton>
        <Typography variant="caption">
          {t('refresh_warning')}
        </Typography>
        <IconButton className={classes.padding} size="small" onClick={hideWarning}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </div>
    </Drawer>
  );
};

WarningDrawer.propTypes = {
  t: PropTypes.func.isRequired,
  dispatchHideWarning: PropTypes.func.isRequired,
};


// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchHideWarning: () => dispatch(layoutWarningDrawerHide()),
});

export default connect(null, mapDispatchToProps)(withTranslation(['plugin'])(WarningDrawer));
