import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import { SIZES, MEDIUM } from '@misakey/ui/Avatar';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Screen from '@misakey/ui/Screen';
import PaperSlope from '@misakey/ui/Paper/Slope';
import Box from '@material-ui/core/Box';
import BoxFloatAvatar from '@misakey/ui/Box/FloatAvatar';

// HOOKS
const useStyles = makeStyles((theme) => ({
  screenRoot: {
    position: 'relative',
    boxSizing: 'border-box',
  },
  content: {
    isolation: 'isolate',
    position: 'relative',
    [theme.breakpoints.only('xs')]: {
      height: '100%',
    },
  },
  toolbarFallback: theme.mixins.toolbar,
}));

// COMPONENTS
const ScreenSlope = forwardRef(({
  component: Component,
  children, classes,
  avatar, avatarSize, header,
  slopeProps,
  ...props
}, ref) => {
  const internalClasses = useStyles();

  const rootClasses = useMemo(
    () => ({
      root: internalClasses.screenRoot,
      ...classes,
    }),
    [internalClasses, classes],
  );

  return (
    <Component
      ref={ref}
      classes={rootClasses}
      {...props}
    >
      <PaperSlope {...slopeProps} />
      {header || ( // when no header, use a box for similar spacing
        <Box className={internalClasses.toolbarFallback} />
      )}
      <Box
        display="flex"
        flexDirection="column"
        flexGrow="1"
      >
        {avatar && (
          <BoxFloatAvatar size={avatarSize}>
              {avatar}
          </BoxFloatAvatar>
        )}
        <Box className={internalClasses.content}>
          {children}
        </Box>
      </Box>
    </Component>
  );
});

ScreenSlope.propTypes = {
  component: PropTypes.elementType,
  children: PropTypes.node,
  classes: PropTypes.object,
  header: PropTypes.node,
  avatar: PropTypes.node,
  avatarSize: PropTypes.oneOf(SIZES),
  slopeProps: PropTypes.object,
};

ScreenSlope.defaultProps = {
  component: Screen,
  children: null,
  classes: {},
  header: null,
  avatar: null,
  avatarSize: MEDIUM,
  slopeProps: {},
};

export default ScreenSlope;
