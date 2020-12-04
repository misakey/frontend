import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import ScreenSplashBase from '@misakey/ui/Screen/Splash/Base';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';

// COMPONENTS
const ScreenSplash = ({ text, ...rest }) => (
  <ScreenSplashBase {...rest}>
    <Box mb={1}>
      <HourglassEmptyIcon fontSize="large" color="secondary" />
    </Box>
    <Typography variant="h5" component="h3" color="textSecondary">
      {text}
    </Typography>
  </ScreenSplashBase>
);

ScreenSplash.propTypes = {
  text: PropTypes.string,
};

ScreenSplash.defaultProps = {
  text: null,
};

export default ScreenSplash;
