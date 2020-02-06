import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect, useLocation } from 'react-router-dom';

import MAIL_TYPES, { CORDIAL } from 'constants/mailTypes';

import isNil from '@misakey/helpers/isNil';
import getNextSearch from 'helpers/getNextSearch';
import getSearchParams from '@misakey/helpers/getSearchParams';
import ToggleButtonGroupMailType from 'components/dumb/ToggleButtonGroup/MailType';

// COMPONENTS
const ToggleButtonGroupMailTypeWithSearchParams = ({ values, defaultValue, prefix, ...rest }) => {
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

  const valuesWithCustomProps = useMemo(
    () => values.map((type) => ({ type, component: Link, to: getLinkTo(type), replace: true })),
    [getLinkTo, values],
  );

  if (hasNoMailType) {
    return <Redirect to={defaultRedirectTo} />;
  }

  return (
    <ToggleButtonGroupMailType
      values={valuesWithCustomProps}
      currentValue={currentValue}
      prefix={prefix}
      {...rest}
    />
  );
};

ToggleButtonGroupMailTypeWithSearchParams.propTypes = {
  values: PropTypes.arrayOf(PropTypes.string),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  prefix: PropTypes.string,
};

ToggleButtonGroupMailTypeWithSearchParams.defaultProps = {
  values: MAIL_TYPES,
  defaultValue: CORDIAL,
  prefix: 'mailType',
};

export default ToggleButtonGroupMailTypeWithSearchParams;
