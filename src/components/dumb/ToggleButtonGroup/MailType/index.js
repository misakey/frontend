import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import MAIL_TYPES, { CORDIAL } from 'constants/mailTypes';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

// HOOKS
const useStyles = makeStyles((theme) => ({
  toggleButtonGroupRoot: {
    display: 'flex',
    justifyContent: 'center',
  },
  toggleButtonGroupGrouped: {
    [theme.breakpoints.only('xs')]: {
      padding: `0 calc(${theme.spacing(0.5) - 1}px) 0 ${theme.spacing(0.5)}px`,
      fontSize: theme.typography.caption.fontSize,
    },
  },
  toggleButtonSelected: {
    color: `${theme.palette.secondary.main} !important`,
    backgroundColor: 'transparent !important',
  },
}));

// COMPONENTS
const ToggleButtonGroupMailType = ({ values, currentValue, prefix, t, ...rest }) => {
  const classes = useStyles();

  return (
    <ToggleButtonGroup
      classes={{ root: classes.toggleButtonGroupRoot, grouped: classes.toggleButtonGroupGrouped }}
      value={currentValue}
      exclusive
      aria-label={t(`citizen__new:${prefix}.model`)}
      {...omitTranslationProps(rest)}
    >
      {values.map(({ type, ...props }) => (
        <ToggleButton
          key={type}
          classes={{ selected: classes.toggleButtonSelected }}
          value={type}
          aria-label={t(`citizen__new:${prefix}.type.${type}`)}
          {...props}
        >
          {t(`citizen__new:${prefix}.type.${type}`)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

ToggleButtonGroupMailType.propTypes = {
  values: PropTypes.arrayOf(PropTypes.shape({ type: PropTypes.string })),
  currentValue: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  prefix: PropTypes.string,
  t: PropTypes.func.isRequired,
};

ToggleButtonGroupMailType.defaultProps = {
  values: MAIL_TYPES.map((type) => ({ type })),
  currentValue: CORDIAL,
  prefix: 'contact.email',
};

export default withTranslation('citizen__new')(ToggleButtonGroupMailType);
