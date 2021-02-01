import React, { forwardRef } from 'react';
import MuiTabs from '@material-ui/core/Tabs';

import makeStyles from '@material-ui/core/styles/makeStyles';

// HOOKS
const useStyles = makeStyles(() => ({
  tabsRoot: {
    minHeight: 'auto',
  },
}));

const Tabs = forwardRef((props, ref) => {
  const classes = useStyles();

  return <MuiTabs ref={ref} classes={{ root: classes.tabsRoot }} {...props} />;
});

export default Tabs;
