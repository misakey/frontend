import React from 'react';
import PropTypes from 'prop-types';
import { Link, generatePath, useLocation, matchPath } from 'react-router-dom';
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

const TABS_ALLOWED_FOR_UNKNOWN = ['legal', 'more'];

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
  focusedTab: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  tabs: {
    minHeight: '32px',
  },
}));

function ApplicationInfoNav({
  elevationScrollTarget, mainDomain, isUnknown, t, isAuthenticated, className, ...rest
}) {
  const classes = useStyles();

  const { pathname } = useLocation();

  const isCurrent = React.useCallback((name) => !!matchPath(pathname, {
    path: routes.citizen.application[name],
  }), [pathname]);

  const applicationTabs = React.useMemo(
    () => (isUnknown ? TABS_ALLOWED_FOR_UNKNOWN : APPLICATION_TABS),
    [isUnknown],
  );

  const value = React.useMemo(
    () => {
      const index = applicationTabs.findIndex((link) => isCurrent(link));
      return index === -1 ? 0 : index;
    },
    [applicationTabs, isCurrent],
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
            indicatorColor="secondary"
            textColor="secondary"
            aria-label={t('screens:application.nav.label', { mainDomain })}
          >
            {applicationTabs.map((link) => (
              <Tab
                key={`tab-${link}`}
                className={classes.linkTab}
                component={Link}
                label={t(`screens:application.nav.${link}`)}
                to={generatePath(routes.citizen.application[link], { mainDomain })}
                disableFocusRipple
                focusVisibleClassName={classes.focusedTab}
              />
            ))}
          </Tabs>
        </Container>
      </AppBar>
    </ElevationScroll>

  );
}

ApplicationInfoNav.propTypes = {
  className: PropTypes.string,
  mainDomain: PropTypes.string.isRequired,
  isUnknown: PropTypes.bool,
  t: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  elevationScrollTarget: PropTypes.instanceOf(Element),
};

ApplicationInfoNav.defaultProps = {
  isUnknown: false,
  className: undefined,
  elevationScrollTarget: undefined,
};

export default withTranslation('screens')(ApplicationInfoNav);
