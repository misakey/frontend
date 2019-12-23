import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import clsx from 'clsx';
import API from '@misakey/api';

import boulder from '@misakey/ui/colors/boulder';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import { fade } from '@material-ui/core/styles/colorManipulator';

const styles = (theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  default: {
    background: theme.palette.common.white,
  },
  backdrop: {
    background: fade(boulder[50], 0.85),
  },
  inherit: {
    background: 'transparent',
  },
  httpStatus: {
    fontSize: '175px',
    color: fade(boulder[500], 0.15),
  },
  h3: {
    padding: theme.spacing(0, 2),
  },
});

function ErrorOverlay({ classes, error, httpStatus, t, variant }) {
  const getText = React.useMemo(() => error
    || (httpStatus && API.errors.httpStatus.includes(httpStatus) && t(`httpStatus.error.${httpStatus}`))
    || t('httpStatus.error.default'),
  [error, httpStatus, t]);

  return (
    <div className={clsx(classes.root, classes[variant])}>
      {!!httpStatus && (
        <Typography className={classes.httpStatus} variant="h1" align="center" component="p">
          {httpStatus}
        </Typography>
      )}
      <Typography className={classes.h3} variant="h5" component="h3" align="center" color="textSecondary">
        {getText}
      </Typography>
    </div>
  );
}

ErrorOverlay.propTypes = {
  classes: PropTypes.object,
  error: PropTypes.string,
  httpStatus: PropTypes.number,
  t: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'backdrop', 'inherit']),
};

ErrorOverlay.defaultProps = {
  classes: {},
  error: null,
  httpStatus: null,
  variant: 'default',
};

export default withTranslation()(withStyles(styles)(ErrorOverlay));
