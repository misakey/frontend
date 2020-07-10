import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import omit from '@misakey/helpers/omit';
import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';
import { useTheme } from '@material-ui/core/styles';

import Screen from 'components/dumb/Screen';
import AppBarNavigation from 'components/dumb/AppBar/Navigation';
import ElevationScroll from 'components/dumb/ElevationScroll';

import { MIN_PX_0_LANDSCAPE, MIN_PX_600 } from '@misakey/ui/constants/medias';

function ScreenAction({
  children, navigation, navigationProps, title, hideTitle, ...rest
}) {
  const theme = useTheme();
  const isXs = useXsMediaQuery();
  const landscape = useMemo(() => window.innerHeight > window.innerWidth, []);

  const threshold = useMemo(() => {
    if (landscape) { return theme.mixins.toolbar[MIN_PX_0_LANDSCAPE].minHeight; }
    if (isXs) { return theme.mixins.toolbar[MIN_PX_600].minHeight; }

    return theme.mixins.toolbar.minHeight;
  }, [theme, isXs, landscape]);

  return (
    <Screen
      title={title}
      {...omit(rest, ['location', 'match', 'staticContext'])}
    >
      <ElevationScroll threshold={threshold}>
        <AppBarNavigation
          position="sticky"
          toolbarProps={{ maxWidth: 'md' }}
          title={hideTitle ? null : title}
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
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.node, PropTypes.element]).isRequired,
  hideTitle: PropTypes.bool,
  navigation: PropTypes.node,
  navigationProps: PropTypes.objectOf(PropTypes.any),
  title: PropTypes.string,
};

ScreenAction.defaultProps = {
  hideTitle: false,
  navigation: null,
  navigationProps: {},
  title: '',
};

export default ScreenAction;
