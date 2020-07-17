
import React, { useMemo } from 'react';
import routes from 'routes';

import { useRouteMatch, useLocation, Link, generatePath } from 'react-router-dom';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

const TABS = [{
  label: 'Chat',
  value: 'chat',
  pathname: routes.boxes._,
}, {
  label: 'Comptes',
  value: 'accounts',
  pathname: routes.accounts._,
}];

const useStyles = makeStyles(() => ({
  tab: {
    minWidth: 'unset',
  },
}));

const TabsMenu = (props) => {
  const theme = useTheme();
  // rule for dialog fullscreen
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const variant = useMemo(() => (isSmDown ? 'fullWidth' : undefined), [isSmDown]);
  const { path } = useRouteMatch();
  const { search } = useLocation();
  const classes = useStyles();
  const { value } = useMemo(() => TABS.find(({ pathname }) => pathname === path), [path]);

  return (
    <Tabs
      indicatorColor="secondary"
      textColor="secondary"
      value={value}
      centered
      variant={variant}
      component={Box}
      flexGrow={1}
      {...props}
    >
      {TABS.map(
        ({ pathname, ...rest }) => (
          <Tab
            className={classes.tab}
            component={Link}
            key={rest.value}
            to={{ pathname: generatePath(pathname), search }}
            {...rest}
          />
        ),
      )}
    </Tabs>
  );
};

export default TabsMenu;
