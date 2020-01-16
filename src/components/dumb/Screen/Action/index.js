import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import omit from '@misakey/helpers/omit';
import useWidth from '@misakey/hooks/useWidth';
import { useTheme } from '@material-ui/core/styles';

import Screen from 'components/dumb/Screen';
import Navigation from 'components/dumb/Navigation';
import ElevationScroll from 'components/dumb/ElevationScroll';

import { MIN_PX_0_LANDSCAPE, MIN_PX_600 } from 'constants/ui/medias';

function ScreenAction({
  appBarProps, children, hideAppBar, history, navigation, navigationProps, pushPath, title, ...rest
}) {
  const theme = useTheme();
  const width = useWidth();
  const landscape = useMemo(() => window.innerHeight > window.innerWidth, []);

  const threshold = useMemo(() => {
    if (hideAppBar) { return 0; }
    if (landscape) { return theme.mixins.toolbar[MIN_PX_0_LANDSCAPE].minHeight; }
    if (width !== 'xs') { return theme.mixins.toolbar[MIN_PX_600].minHeight; }

    return theme.mixins.toolbar.minHeight;
  }, [hideAppBar, theme, width, landscape]);

  return (
    <Screen
      title={title}
      disableGutters
      hideAppBar={hideAppBar}
      appBarProps={{ position: 'fixed', elevationScroll: false, ...appBarProps }}
      {...omit(rest, ['location', 'match', 'staticContext'])}
    >
      <ElevationScroll threshold={threshold}>
        <Navigation
          position="sticky"
          toolbarProps={{ maxWidth: 'md' }}
          pushPath={pushPath}
          history={history}
          title={title}
          {...navigationProps}
        >
          {navigation}
        </Navigation>
      </ElevationScroll>
      {children}
    </Screen>
  );
}

ScreenAction.propTypes = {
  appBarProps: PropTypes.objectOf(PropTypes.any),
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.node, PropTypes.element]).isRequired,
  hideAppBar: PropTypes.bool,
  history: PropTypes.object.isRequired,
  navigation: PropTypes.node,
  navigationProps: PropTypes.objectOf(PropTypes.any),
  pushPath: PropTypes.string,
  title: PropTypes.string,
};

ScreenAction.defaultProps = {
  appBarProps: {},
  hideAppBar: false,
  navigation: null,
  navigationProps: {},
  pushPath: null,
  title: '',
};

export default withRouter(ScreenAction);
