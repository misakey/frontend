import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';

// HOOKS
const useBoxStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    height: 'inherit',
    backgroundColor: theme.palette.background.default,
  },
}));

// COMPONENTS
const ScreenSplashBase = ({ children, containerProps, ...rest }) => {
  const classes = useBoxStyles();

  return (
    <Box className={classes.root} {...rest}>
      <Container maxWidth="md" {...containerProps}>
        {children}
      </Container>
    </Box>
  );
};

ScreenSplashBase.propTypes = {
  children: PropTypes.node,
  containerProps: PropTypes.object,
};

ScreenSplashBase.defaultProps = {
  children: null,
  containerProps: {},
};

export default ScreenSplashBase;
