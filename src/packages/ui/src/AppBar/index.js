import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import MuiAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Box';

// CONSTANTS
export const PROP_TYPES = {
  toolbarProps: PropTypes.object,
  offsetHeight: PropTypes.number,
  disableOffset: PropTypes.bool,
  children: PropTypes.node,
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  offset: ({ offsetHeight }) => ({
    ...theme.mixins.toolbar,
    ...(offsetHeight ? { height: `${offsetHeight}px` } : {}),
  }),
}));

// COMPONENTS
const AppBar = ({
  toolbarProps,
  offsetHeight,
  disableOffset,
  children,
  ...props
}) => {
  const classes = useStyles({ offsetHeight });

  return (
    <>
      <MuiAppBar
        position="fixed"
        color="inherit"
        elevation={0}
        {...props}
      >
        <Toolbar component={Box} px={2} disableGutters {...toolbarProps}>
          {children}
        </Toolbar>
      </MuiAppBar>
      {!disableOffset && <Box className={classes.offset} />}
    </>
  );
};

AppBar.propTypes = PROP_TYPES;

AppBar.defaultProps = {
  children: null,
  toolbarProps: {},
  offsetHeight: null,
  disableOffset: false,
};

export default AppBar;
