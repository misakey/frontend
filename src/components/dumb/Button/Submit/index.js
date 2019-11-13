import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omit from '@misakey/helpers/omit';
import tDefault from '@misakey/helpers/tDefault';

import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';
import CircularProgress from '@material-ui/core/CircularProgress';

// HELPERS
const makeStyles = (theme) => ({
  leftIcon: {
    marginRight: theme.spacing(1),
  },
  wrapper: {
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

// COMPONENTS
const ButtonSubmit = ({
  classes, Icon, isSubmitting, isValid,
  t, text, progressProps, ...rest
}) => (
  <span className={classes.wrapper}>
    <Button
      type="submit"
      variant="contained"
      color="secondary"
      disabled={isSubmitting || !isValid}
      {...omit(rest, ['i18n', 'tReady'])}
    >
      {Icon ? <Icon className={classes.leftIcon} /> : null}
      {text || t('submit', 'Submit')}
    </Button>
    {isSubmitting && (
      <CircularProgress size={24} className={classes.buttonProgress} {...progressProps} />
    )}
  </span>
);

ButtonSubmit.propTypes = {
  classes: PropTypes.objectOf(PropTypes.string),
  Icon: PropTypes.elementType,
  isSubmitting: PropTypes.bool,
  isValid: PropTypes.bool,
  progressProps: PropTypes.object,
  t: PropTypes.func,
  text: PropTypes.string,
};

ButtonSubmit.defaultProps = {
  classes: {},
  Icon: SendIcon,
  isSubmitting: false,
  isValid: true,
  progressProps: {},
  text: '',
  t: tDefault,
};

export default withStyles(makeStyles)(withTranslation()(ButtonSubmit));
