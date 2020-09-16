import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import AppBarNavigation from 'components/dumb/AppBar/Navigation';
import ElevationScroll from 'components/dumb/ElevationScroll';

import { MIN_PX_0_LANDSCAPE, MIN_PX_600 } from '@misakey/ui/constants/medias';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';

function ScreenAction({
  children, navigation, navigationProps, title, hideTitle, isLoading,
}) {
  const theme = useTheme();
  const isXs = useXsMediaQuery();
  const landscape = useMemo(() => window.innerHeight > window.innerWidth, []);

  const threshold = useMemo(() => {
    if (landscape) { return theme.mixins.toolbar[MIN_PX_0_LANDSCAPE].minHeight; }
    if (isXs) { return theme.mixins.toolbar[MIN_PX_600].minHeight; }

    return theme.mixins.toolbar.minHeight;
  }, [theme, isXs, landscape]);

  useUpdateDocHead(title);

  return (
    <Box display="flex" flexDirection="column" height="inherit">
      <ElevationScroll threshold={threshold}>
        <AppBarNavigation
          position="sticky"
          title={hideTitle ? null : title}
          gutterBottom={false}
          {...navigationProps}
        >
          {navigation}
        </AppBarNavigation>
      </ElevationScroll>
      <Box mt={3} height="inherit">
        {isLoading ? <SplashScreen /> : children}
      </Box>
    </Box>
  );
}

ScreenAction.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.node, PropTypes.element]).isRequired,
  hideTitle: PropTypes.bool,
  isLoading: PropTypes.bool,
  navigation: PropTypes.node,
  navigationProps: PropTypes.objectOf(PropTypes.any),
  title: PropTypes.string,
};

ScreenAction.defaultProps = {
  hideTitle: false,
  isLoading: false,
  navigation: null,
  navigationProps: {},
  title: '',
};

export default ScreenAction;
