import React from 'react';
import PropTypes from 'prop-types';

import { useFormikContext } from 'formik';

import { Prompt } from 'react-router-dom';

// COMPONENTS
const FormikDirtyPrompt = ({ title, ...props }) => {
  const { dirty } = useFormikContext();

  return (
    <Prompt
      when={dirty}
      message={title}
      {...props}
    />
  );
};

FormikDirtyPrompt.propTypes = {
  title: PropTypes.string.isRequired,
};

export default FormikDirtyPrompt;
