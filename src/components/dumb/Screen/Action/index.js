import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import omit from '@misakey/helpers/omit';
import useWidth from '@misakey/hooks/useWidth';
import { useTheme } from '@material-ui/core/styles';

import Screen from 'components/dumb/Screen';
import AppBarNavigation from 'components/dumb/AppBar/Navigation';
import ElevationScroll from 'components/dumb/ElevationScroll';

import { MIN_PX_0_LANDSCAPE, MIN_PX_600 } from '@misakey/ui/constants/medias';

function ScreenAction({
  appBarProps, children, hideAppBar, navigation, navigationProps, title, ...rest
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
      hideAppBar={hideAppBar}
      appBarProps={{ position: 'fixed', elevationScroll: false, ...appBarProps }}
      {...omit(rest, ['location', 'match', 'staticContext'])}
    >
      <ElevationScroll threshold={threshold}>
        <AppBarNavigation
          position="sticky"
          toolbarProps={{ maxWidth: 'md' }}
          title={title}
          {...navigationProps}
        >
          {navigation}
        </AppBarNavigation>
      </ElevationScroll>
      {children}
    </Screen>
  );
}

ScreenAction.propTypes = {
  appBarProps: PropTypes.objectOf(PropTypes.any),
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.node, PropTypes.element]).isRequired,
  hideAppBar: PropTypes.bool,
  navigation: PropTypes.node,
  navigationProps: PropTypes.objectOf(PropTypes.any),
  title: PropTypes.string,
};

ScreenAction.defaultProps = {
  appBarProps: {},
  hideAppBar: false,
  navigation: null,
  navigationProps: {},
  title: '',
};

export default ScreenAction;
