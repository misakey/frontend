import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';

import { useEffect } from 'react';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useFormikContext } from 'formik';

const ResetOnBoxChange = ({ box }) => {
  const { resetForm } = useFormikContext();

  const { id } = useSafeDestr(box);

  useEffect(
    () => {
      resetForm();
    },
    [id, resetForm],
  );

  return null;
};

ResetOnBoxChange.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
};

export default ResetOnBoxChange;
