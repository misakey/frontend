import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import ScreenSplashBase from '@misakey/ui/Screen/Splash/Base';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';

// HOOKS
const useStyles = makeStyles(() => ({
  fullWidth: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

// COMPONENTS
const ScreenSplash = ({ text, loading, ...rest }) => {
  const classes = useStyles();

  return (
    <ScreenSplashBase {...rest}>
      <Box mb={1}>
        <HourglassEmptyIcon fontSize="large" color="primary" />
      </Box>
      <Typography className={classes.fullWidth} variant="h5" color="textSecondary">
        {loading ? (
          <Skeleton width={100} />
        ) : text}
      </Typography>
    </ScreenSplashBase>
  );
};

ScreenSplash.propTypes = {
  text: PropTypes.string,
  loading: PropTypes.bool,
};

ScreenSplash.defaultProps = {
  text: null,
  loading: false,
};

export default ScreenSplash;
