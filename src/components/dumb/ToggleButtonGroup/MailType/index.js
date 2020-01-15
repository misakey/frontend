import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';

import MAIL_TYPES, { FRIENDLY_LEGAL } from 'constants/mailTypes';

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

// HOOKS
const useStyles = makeStyles((theme) => ({
  toggleButtonGroupRoot: {
    display: 'flex',
    justifyContent: 'center',
  },
  toggleButtonSelected: {
    color: `${theme.palette.secondary.main} !important`,
    backgroundColor: 'transparent !important',
  },
}));

// COMPONENTS
const ToggleButtonGroupMailType = ({ values, currentValue, prefix, t }) => {
  const classes = useStyles();

  return (
    <ToggleButtonGroup
      classes={{ root: classes.toggleButtonGroupRoot }}
      value={currentValue}
      exclusive
      aria-label={t(`common:${prefix}.group`)}
    >
      {values.map(({ type, ...props }) => (
        <ToggleButton
          key={type}
          classes={{ selected: classes.toggleButtonSelected }}
          value={type}
          aria-label={t(`common:${prefix}.types.${type}`)}
          {...props}
        >
          {t(`common:${prefix}.types.${type}`)}
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
  currentValue: FRIENDLY_LEGAL,
  prefix: 'mailType',
};

export default withTranslation('common')(ToggleButtonGroupMailType);
