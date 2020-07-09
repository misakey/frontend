import { useMemo } from 'react';
import { useField } from 'formik';
import { getFieldError } from '@misakey/helpers/formikError';

export default ({ name, prefix }) => {
  const [field, meta, helpers] = useField(name);

  const errorMeta = useMemo(
    () => getFieldError({ field, meta, prefix }),
    [field, meta, prefix],
  );

  return useMemo(
    () => ({ field, meta, helpers, ...errorMeta }),
    [errorMeta, field, helpers, meta],
  );
};
