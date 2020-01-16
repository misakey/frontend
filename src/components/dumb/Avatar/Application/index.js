import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';
import isNumber from '@misakey/helpers/isNumber';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import ApplicationImg from 'components/dumb/Application/Img';
import Typography from '@material-ui/core/Typography';
import Rating from '@material-ui/lab/Rating';

// HOOKS
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
    overflow: 'hidden',
  },
  appName: {
    marginLeft: theme.spacing(2),
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  mainDomain: {
    marginRight: theme.spacing(1),
  },
  ratingIcon: {
    color: theme.palette.primary.main,
  },
}));

const ApplicationAvatar = ({ application, displayRating, displayMainDomain, fullWidth }) => {
  const classes = useStyles();

  const { name, logoUri, mainDomain, avgRating } = useMemo(
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
      <ApplicationImg
        src={logoUri}
        applicationName={applicationName}
      />
      <div className={classes.appName}>
        <Typography noWrap color="textSecondary">
          {applicationName}
        </Typography>

        <Box display="flex">
          {displayMainDomain && (
            <Typography noWrap variant="body2" color="textSecondary" className={classes.mainDomain}>
              {mainDomain}
            </Typography>
          )}
          {displayRating && isNumber(avgRating) && avgRating > 0 && (
            <Rating
              readOnly
              size="small"
              value={avgRating}
              classes={{ iconFilled: classes.ratingIcon }}
            />
          )}
        </Box>

      </div>

    </Box>
  );
};

ApplicationAvatar.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
  displayRating: PropTypes.bool,
  displayMainDomain: PropTypes.bool,
  fullWidth: PropTypes.bool,
};

ApplicationAvatar.defaultProps = {
  application: null,
  displayRating: false,
  displayMainDomain: false,
  fullWidth: false,
};

export default withTranslation(['screens'])(ApplicationAvatar);
