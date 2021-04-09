import { useMemo } from 'react';
import { useField } from 'formik';
import { getFieldError, getArrayFieldError } from '@misakey/core/helpers/formikError';

export default ({ name, prefix, suffix, multiple, parseError, ...rest }) => {
  const fieldProps = useMemo(
    () => {
      if (multiple) {
        return { name, multiple, ...rest };
      }
      return { name, ...rest };
    },
    [name, multiple, rest],
  );

  const [field, meta, helpers] = useField(fieldProps);

  // {displayErrors: Boolean, errorKeys: []}
  const errorMeta = useMemo(
    () => (multiple
      ? getArrayFieldError({ field, meta, prefix, suffix }, parseError)
      : getFieldError({ field, meta, prefix, suffix }, parseError)),
    [multiple, field, meta, prefix, suffix, parseError],
  );

  return useMemo(
    () => ({ field, meta, helpers, ...errorMeta }),
    [errorMeta, field, helpers, meta],
  );
};
