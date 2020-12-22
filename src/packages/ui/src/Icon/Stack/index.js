import { forwardRef } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';

// CONSTANTS
const BACKGROUND_FONT_SIZES = {
  large: '3.2rem',
  default: '2.1875rem',
  small: '1.8rem',
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  stack: ({ color }) => ({
    position: 'absolute',
    color: theme.palette.text[color],
  }),
  background: ({ fontSize }) => ({
    opacity: '0.6',
    fontSize: fontSize === 'inherit' ? fontSize : BACKGROUND_FONT_SIZES[fontSize],
  }),
  foreground: {
    opacity: '0.6',
  },
}));

// COMPONENTS
const IconStack = forwardRef(({
  ForegroundIcon, BackgroundIcon,
  color, fontSize,
  ...props
}, ref) => {
  const classes = useStyles({ color, fontSize });

  return (
    <Box
      position="relative"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <BackgroundIcon ref={ref} className={clsx(classes.background, classes.stack)} {...props} />
      <ForegroundIcon
        fontSize={fontSize}
        className={clsx(classes.stack, classes.foreground)}
        {...props}
      />
    </Box>
  );
});

IconStack.propTypes = {
  ForegroundIcon: PropTypes.elementType.isRequired,
  BackgroundIcon: PropTypes.elementType.isRequired,
  color: PropTypes.string,
  fontSize: PropTypes.oneOf(['inherit', 'default', 'small', 'large']),
};

IconStack.defaultProps = {
  color: 'primary',
  fontSize: 'default',
};

export default IconStack;
