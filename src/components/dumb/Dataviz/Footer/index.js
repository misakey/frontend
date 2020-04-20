import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

// HOOKS
const useStyles = makeStyles((theme) => ({
  typo: {
    color: theme.palette.common.white,
    textAlign: 'center',
    position: 'absolute',
    bottom: theme.spacing(1),
    left: 0,
    right: 0,
  },
}));

const DatavizFooter = ({ t }) => {
  const classes = useStyles();

  return (
    <Typography
      className={classes.typo}
      variant="caption"
    >
      {t('citizen:dataviz.socialCardFooter')}
    </Typography>
  );
};

DatavizFooter.propTypes = {
  t: PropTypes.func.isRequired,
};


export default withTranslation('citizen')(DatavizFooter);
