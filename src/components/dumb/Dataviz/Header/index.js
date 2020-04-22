import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import UserAvatar from '@misakey/ui/Avatar/User';
import ApplicationImg from 'components/dumb/Application/Img';

// HOOKS
const useStyles = makeStyles((theme) => ({
  userLogo: {
    marginRight: -theme.spacing(1),
  },
  appLogo: {
    marginLeft: -theme.spacing(1),
    border: '1px solid white',
  },
  typo: {
    color: theme.palette.common.white,
  },
}));

const DatavizHeader = ({ application, user, subtitle }) => {
  const classes = useStyles();

  const { avatarUri, displayName } = user;
  const { logoUri, name: applicationName } = application;

  return (
    <Box p={2} display="flex" justifyContent="left">
      <Box display="flex" justifyContent="center">
        <UserAvatar
          avatarUri={avatarUri}
          displayName={displayName}
          className={classes.userLogo}
          imgProps={{ crossorigin: 'anonymous' }}
        />
        <ApplicationImg
          src={logoUri}
          applicationName={applicationName}
          className={classes.appLogo}
          imgProps={{ crossorigin: 'anonymous' }}
        />
      </Box>
      <Box display="flex" flexDirection="column" ml={1}>
        <Typography className={classes.typo}>{`${user.displayName} & ${applicationName}`}</Typography>
        { subtitle && (
          <Typography className={classes.typo} variant="caption">{subtitle}</Typography>
        )}
      </Box>
    </Box>
  );
};

DatavizHeader.propTypes = {
  user: PropTypes.shape({
    avatarUri: PropTypes.string,
    displayName: PropTypes.string,
  }).isRequired,
  application: PropTypes.shape({
    logoUri: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
  subtitle: PropTypes.string,
};

DatavizHeader.defaultProps = {
  subtitle: null,
};

export default DatavizHeader;
