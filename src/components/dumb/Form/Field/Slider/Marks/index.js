import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import last from '@misakey/helpers/last';
import pluck from '@misakey/helpers/pluck';
import prop from '@misakey/helpers/prop';
import sortNumbersAsc from '@misakey/helpers/sort/numbers/asc';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import FieldSlider from 'components/dumb/Form/Field/Slider';

// HELPERS
const pluckValue = pluck('value');
const nameProp = prop('name');

// COMPONENTS
// @UNUSED for now, but to keep for future use:
// multiple notifications config in a single screen
const FieldSliderMarks = ({
  marks,
  prefix,
  field,
  t,
  ...rest
}) => {
  const max = useMemo(
    () => {
      const values = sortNumbersAsc(pluckValue(marks));
      return last(values);
    },
    [marks],
  );

  const fieldName = useMemo(
    () => nameProp(field),
    [field],
  );

  const translatedMarks = useMemo(
    () => marks.map(({ label, ...markRest }) => ({
      label: t([`fields:${prefix}${fieldName}.${label}`, `fields:${fieldName}.${label}`]),
      ...markRest,
    })),
    [fieldName, marks, prefix, t],
  );

  return (
    <FieldSlider
      marks={translatedMarks}
      max={max}
      prefix={prefix}
      field={field}
      {...omitTranslationProps(rest)}
    />
  );
};

FieldSliderMarks.propTypes = {
  marks: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number,
    label: PropTypes.string,
  })).isRequired,
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  prefix: PropTypes.string,
  // withTranslation
  t: PropTypes.func.isRequired,
};

FieldSliderMarks.defaultProps = {
  prefix: '',
};

export default withTranslation('fields')(FieldSliderMarks);
