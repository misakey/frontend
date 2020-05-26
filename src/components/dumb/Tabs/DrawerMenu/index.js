
import React, { useMemo } from 'react';
import routes from 'routes';
import { useRouteMatch, useLocation, Link } from 'react-router-dom';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

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

const TabsMenu = () => {
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
      component={Box}
      flexGrow={1}
    >
      {TABS.map(
        ({ pathname, ...rest }) => (
          <Tab
            className={classes.tab}
            component={Link}
            key={rest.value}
            to={{ pathname, search }}
            {...rest}
          />
        ),
      )}
    </Tabs>
  );
};

export default TabsMenu;
