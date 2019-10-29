import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import ApplicationImg from 'components/dumb/Application/Img';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  toolbar: {
    justifyContent: 'space-between',
  },
  appBlock: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  appImg: {
    borderRadius: 5,
  },
  appName: {
    marginLeft: theme.spacing(2),
  },
}));

const ApplicationAvatar = ({ application }) => {
  const classes = useStyles();

  const { name, logoUri } = useMemo(
    () => (isNil(application) ? {} : application),
    [application],
  );

  return (
    <Box p={1} className={classes.appBlock}>
      <ApplicationImg
        classes={{ root: classes.appImg }}
        src={logoUri}
        alt={name}
      >
        {/* @FIXME: this fallback behaviour should be handled inside ApplicationImg */}
        {name.slice(0, 3)}
      </ApplicationImg>
      <Typography variant="h6" color="textSecondary" className={classes.appName}>
        {name}
      </Typography>
    </Box>
  );
};

ApplicationAvatar.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
};

ApplicationAvatar.defaultProps = {
  application: null,
};

export default ApplicationAvatar;
