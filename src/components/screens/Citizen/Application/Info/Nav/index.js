import React from 'react';
import PropTypes from 'prop-types';
import { Link, generatePath, withRouter, matchPath } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';

import omit from '@misakey/helpers/omit';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Container from '@material-ui/core/Container';

import ElevationScroll from 'components/dumb/ElevationScroll';
import { MIN_PX_0_LANDSCAPE, MIN_PX_600 } from 'constants/ui/medias';

import routes from 'routes';

const APPLICATION_TABS = [
  'vault',
  'feedback',
  'legal',
  'more',
];

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    top: theme.mixins.toolbar.minHeight,
    [MIN_PX_0_LANDSCAPE]: {
      top: theme.mixins.toolbar[MIN_PX_0_LANDSCAPE].minHeight,
    },
    [MIN_PX_600]: {
      top: theme.mixins.toolbar[MIN_PX_600].minHeight,
    },
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

function ApplicationInfoNav({
  elevationScrollTarget, location, mainDomain, scrollButtons, t, isAuthenticated, className, ...rest
}) {
  const classes = useStyles();

  const isCurrent = React.useCallback((name) => !!matchPath(location.pathname, {
    path: routes.citizen.application[name],
    exact: name === 'info',
  }), [location.pathname]);

  const value = React.useMemo(
    () => APPLICATION_TABS.indexOf(
      APPLICATION_TABS.find((link) => isCurrent(link)),
    ),
    [isCurrent],
  );


  return (
    <ElevationScroll target={elevationScrollTarget}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        component="nav"
        className={clsx(classes.root, className || {})}
        {...omit(rest, ['i18n', 'tReady', 'history', 'match', 'staticContext'])}
      >
        <Container maxWidth="md">
          <Tabs
            value={value}
            className={classes.tabs}
            variant="scrollable"
            scrollButtons={scrollButtons}
            indicatorColor="secondary"
            textColor="secondary"
            aria-label={t('screens:application.nav.label', { mainDomain })}
          >
            {APPLICATION_TABS.map((link) => (
              <Tab
                key={`tab-${link}`}
                className={classes.linkTab}
                component={Link}
                label={t(`screens:application.nav.${link}`)}
                to={generatePath(routes.citizen.application[link], { mainDomain })}
              />
            ))}
          </Tabs>
        </Container>
      </AppBar>
    </ElevationScroll>

  );
}

ApplicationInfoNav.propTypes = {
  location: PropTypes.shape({ pathname: PropTypes.string, search: PropTypes.string }).isRequired,
  className: PropTypes.string,
  mainDomain: PropTypes.string.isRequired,
  scrollButtons: PropTypes.string,
  t: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  elevationScrollTarget: PropTypes.instanceOf(Element),
};

ApplicationInfoNav.defaultProps = {
  scrollButtons: 'auto',
  className: undefined,
  elevationScrollTarget: undefined,
};

export default withRouter(withTranslation('screens')(ApplicationInfoNav));
