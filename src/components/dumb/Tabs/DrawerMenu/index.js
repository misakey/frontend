
import React, { useMemo } from 'react';
import routes from 'routes';
import PropTypes from 'prop-types';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { useRouteMatch, useLocation, Link, generatePath } from 'react-router-dom';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import makeStyles from '@material-ui/core/styles/makeStyles';
import isNil from '@misakey/helpers/isNil';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import { withTranslation } from 'react-i18next';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import { ACCOUNT_LEFT_DRAWER_QUERY_PARAM } from '@misakey/ui/constants/drawers';
import getNextSearch from '@misakey/helpers/getNextSearch';

export const TAB_VALUES = {
  CHAT: 'chat',
  DOCUMENT: 'document',
};

const TABS = [
  {
    value: TAB_VALUES.CHAT,
    match: [routes.boxes._, routes.boxes.read._],
    pathname: routes.boxes._,
  },
  {
    value: TAB_VALUES.DOCUMENT,
    match: [routes.documents._, routes.documents.vault],
    pathname: routes.documents.vault,
  },
];

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
  const locationSearchParams = useLocationSearchParams();
  const { [ACCOUNT_LEFT_DRAWER_QUERY_PARAM]: leftDrawer } = locationSearchParams;

  const classes = useStyles();
  const { value: selectedValue } = useMemo(
    () => (!isNil(leftDrawer)
      ? { value: leftDrawer }
      : TABS.find(({ match }) => match.includes(path)) || { value: TAB_VALUES.CHAT }),
    [leftDrawer, path],
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
      {...omitTranslationProps(props)}
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
            to={{
              pathname: generatePath(pathname),
              search: getNextSearch(
                search,
                new Map([
                  [ACCOUNT_LEFT_DRAWER_QUERY_PARAM, undefined],
                ]),
              ),
            }}
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
