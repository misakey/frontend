import { useMemo } from 'react';
import { useField } from 'formik';
import { getFieldError, getArrayFieldError } from '@misakey/helpers/formikError';

export default ({ name, prefix, multiple, ...rest }) => {
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
      ? getArrayFieldError({ field, meta, prefix })
      : getFieldError({ field, meta, prefix })),
    [field, meta, prefix, multiple],
  );

  return useMemo(
    () => ({ field, meta, helpers, ...errorMeta }),
    [errorMeta, field, helpers, meta],
  );
};
