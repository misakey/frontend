import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import ApplicationAvatar from 'components/dumb/Avatar/Application';
import Typography from '@material-ui/core/Typography';

// HOOKS
const useStyles = makeStyles((theme) => ({
  appBlock: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  appName: {
    marginLeft: theme.spacing(2),
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

const ApplicationSummary = ({ application, fullWidth }) => {
  const classes = useStyles();

  const { name, logoUri, mainDomain } = useMemo(
    () => (isNil(application) ? {} : application),
    [application],
  );

  const applicationName = useMemo(
    () => name || mainDomain,
    [name, mainDomain],
  );

  const sizingProps = fullWidth ? { width: 1 } : {};

  return (
    <Box className={classes.appBlock} {...sizingProps}>
      <ApplicationAvatar
        src={logoUri}
        name={applicationName}
      />
      <div className={classes.appName}>
        <Typography noWrap color="textSecondary">
          {applicationName}
        </Typography>
      </div>
    </Box>
  );
};

ApplicationSummary.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
  fullWidth: PropTypes.bool,
};

ApplicationSummary.defaultProps = {
  application: null,
  fullWidth: false,
};

export default ApplicationSummary;
