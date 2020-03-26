import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

import UserAvatar from 'components/dumb/Avatar/User';
import ApplicationImg from 'components/dumb/Application/Img';

// HOOKS
const useStyles = makeStyles((theme) => ({
  logos: {
    display: 'flex',
    justifyContent: 'center',
  },
  userLogo: {
    marginRight: -theme.spacing(1),
  },
  appLogo: {
    marginLeft: -theme.spacing(1),
  },
}));

const DatavizHeader = ({ application, user }) => {
  const classes = useStyles();

  const { avatarUri, displayName } = user;
  const { logoUri, name: applicationName } = application;

  return (
    <div>
      <div className={classes.logos}>
        <UserAvatar
          avatarUri={avatarUri}
          displayName={displayName}
          className={classes.userLogo}
        />
        <ApplicationImg
          src={logoUri}
          applicationName={applicationName}
          className={classes.appLogo}
        />
      </div>
      <Typography align="center">
        {`${user.displayName} & ${applicationName}`}
      </Typography>
    </div>
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
};

export default DatavizHeader;
