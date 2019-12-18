import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link, Redirect, useLocation } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import MAIL_TYPES, { FRIENDLY_LEGAL } from 'constants/mailTypes';

import isNil from '@misakey/helpers/isNil';
import getNextSearch from 'helpers/getNextSearch';
import getSearchParams from '@misakey/helpers/getSearchParams';

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
const ToggleButtonGroupMailType = ({ values, defaultValue, prefix, t }) => {
  const classes = useStyles();

  const { search, pathname } = useLocation();
  const mailType = useMemo(
    () => getSearchParams(search).mailType,
    [search],
  );

  const currentValue = useMemo(
    () => mailType || defaultValue,
    [defaultValue, mailType],
  );

  const getLinkTo = useCallback(
    (type) => ({ search: getNextSearch(search, new Map([['mailType', type]])) }),
    [search],
  );

  const hasNoMailType = useMemo(
    () => isNil(mailType),
    [mailType],
  );

  const defaultRedirectTo = useMemo(
    () => ({ pathname, search: getNextSearch(search, new Map([['mailType', defaultValue]])) }),
    [defaultValue, pathname, search],
  );

  if (hasNoMailType) {
    return <Redirect to={defaultRedirectTo} />;
  }

  return (
    <ToggleButtonGroup
      classes={{ root: classes.toggleButtonGroupRoot }}
      value={currentValue}
      exclusive
      aria-label={t(`common:${prefix}.group`)}
    >
      {values.map((type) => (
        <ToggleButton
          key={type}
          classes={{ selected: classes.toggleButtonSelected }}
          component={Link}
          to={getLinkTo(type)}
          replace
          value={type}
          aria-label={t(`common:${prefix}.types.${type}`)}
        >
          {t(`common:${prefix}.types.${type}`)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

ToggleButtonGroupMailType.propTypes = {
  values: PropTypes.arrayOf(PropTypes.string),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  prefix: PropTypes.string,
  t: PropTypes.func.isRequired,
};

ToggleButtonGroupMailType.defaultProps = {
  values: MAIL_TYPES,
  defaultValue: FRIENDLY_LEGAL,
  prefix: 'mailType',
};

export default withTranslation('common')(ToggleButtonGroupMailType);
