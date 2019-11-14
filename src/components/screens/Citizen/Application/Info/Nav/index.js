import React from 'react';
import PropTypes from 'prop-types';
import { Link, generatePath, withRouter, matchPath } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import omit from '@misakey/helpers/omit';
import pickBy from '@misakey/helpers/pickBy';
import useWidth from '@misakey/hooks/useWidth';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import routes from 'routes';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.grey[100]}`,
  },
  linkTab: {
    fontSize: theme.typography.caption.fontSize,
    minHeight: '32px',
    padding: '6px 9px',
  },
  tabs: {
    minHeight: '32px',
  },
}));

function ApplicationNavTabs({ location, mainDomain, scrollButtons, t, isAuthenticated, ...rest }) {
  const classes = useStyles();
  const width = useWidth();

  const variant = React.useMemo(() => (['xs', 'sm'].includes(width) ? 'scrollable' : 'standard'), [width]);

  const applicationTabsLinks = React.useMemo(() => Object.keys(pickBy({
    info: true,
    // FIXME : remove when unauthenticated view with CTA to singin is implemented
    personalData: window.env.PLUGIN ? isAuthenticated : true,
    // FIXME : remove when thirdparty in webapp is implemented
    thirdParty: window.env.PLUGIN,
    myAccount: false,
  }, (value) => value === true)), [isAuthenticated]);

  const isCurrent = React.useCallback((name) => !!matchPath(location.pathname, {
    path: routes.citizen.application[name],
    exact: name === 'info',
  }), [location.pathname]);

  const value = React.useMemo(
    () => applicationTabsLinks.indexOf(
      applicationTabsLinks.find((link) => isCurrent(link)),
    ),
    [isCurrent, applicationTabsLinks],
  );

  return (
    <AppBar
      elevation={0}
      color="inherit"
      component="nav"
      position={window.env.PLUGIN ? 'static' : 'sticky'}
      className={classes.root}
      {...omit(rest, ['i18n', 'tReady', 'history', 'match', 'staticContext'])}
    >
      <Tabs
        value={value}
        className={classes.tabs}
        variant={variant}
        scrollButtons={scrollButtons}
        indicatorColor="secondary"
        textColor="secondary"
        aria-label={t('screens:application.nav.label', { mainDomain })}
      >
        {applicationTabsLinks.map((link) => (
          <Tab
            key={`tab-${link}`}
            className={classes.linkTab}
            component={Link}
            label={t(`screens:application.nav.${link}`)}
            to={generatePath(routes.citizen.application[link], { mainDomain }) + location.search}
          />
        ))}
      </Tabs>
    </AppBar>
  );
}

ApplicationNavTabs.propTypes = {
  location: PropTypes.shape({ pathname: PropTypes.string, search: PropTypes.string }).isRequired,
  mainDomain: PropTypes.string.isRequired,
  scrollButtons: PropTypes.string,
  t: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

ApplicationNavTabs.defaultProps = {
  scrollButtons: 'auto',
};

export default withRouter(withTranslation('screens')(ApplicationNavTabs));
