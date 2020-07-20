
import React, { useMemo } from 'react';
import routes from 'routes';
import PropTypes from 'prop-types';

import { useRouteMatch, useLocation, Link, generatePath } from 'react-router-dom';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import { withTranslation } from 'react-i18next';

const TABS = [{
  value: 'chat',
  pathname: routes.boxes._,
}, {
  value: 'account',
  pathname: routes.accounts._,
}];

const useStyles = makeStyles(() => ({
  indicator: {
    display: 'none',
  },
  tab: {
    minWidth: 'unset',
  },
}));

const TabsMenu = ({ t, ...props }) => {
  const theme = useTheme();
  // rule for dialog fullscreen
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const variant = useMemo(() => (isSmDown ? 'fullWidth' : undefined), [isSmDown]);
  const { path } = useRouteMatch();
  const { search } = useLocation();
  const classes = useStyles();
  const { value: selectedValue } = useMemo(
    () => TABS.find(({ pathname }) => pathname === path), [path],
  );

  return (
    <Tabs
      indicatorColor="secondary"
      textColor="secondary"
      value={selectedValue}
      centered
      variant={variant}
      component={Box}
      classes={{ indicator: classes.indicator }}
      flexGrow={1}
      {...props}
    >
      {TABS.map(
        ({ pathname, value, ...rest }) => (
          <Tab
            className={classes.tab}
            component={Link}
            disableRipple
            disableFocusRipple
            key={value}
            value={value}
            label={t(`common:drawerMenu.tabs.${value}`)}
            to={{ pathname: generatePath(pathname), search }}
            {...rest}
          />
        ),
      )}
    </Tabs>
  );
};

TabsMenu.propTypes = {
  t: PropTypes.func.isRequired,
};


export default withTranslation('common')(TabsMenu);
