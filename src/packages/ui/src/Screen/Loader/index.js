import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import LinearProgress from '@material-ui/core/LinearProgress';

// HOOKS
const useStyles = makeStyles((theme) => ({
  progress: {
    position: 'fixed',
    width: '100%',
    top: 0,
    zIndex: theme.zIndex.tooltip,
  },
}));

const ScreenLoader = ({ isLoading, ...props }) => {
  const classes = useStyles();


  if (isLoading) {
    return (
      <LinearProgress
        className={classes.progress}
        color="secondary"
        variant="query"
        {...props}
      />
    );
  }
  return null;
};

ScreenLoader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
};

export default ScreenLoader;
