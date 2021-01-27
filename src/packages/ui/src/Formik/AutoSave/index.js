import React, { useMemo, useCallback, useRef, useEffect } from 'react';

import PropTypes from 'prop-types';

import debounce from '@misakey/helpers/debounce';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { isFunction, useFormikContext } from 'formik';

import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';

// COMPONENTS
const FormikAutoSave = (
  { debounceMs, onSuccess, debounceLoader, circularProgressProps, ...rest },
) => {
  const { submitForm, values, isSubmitting, setSubmitting, dirty } = useFormikContext();

  const dirtyRef = useRef(dirty);

  const onSubmit = useCallback(
    () => {
      if (dirtyRef.current === true) {
        submitForm().then(() => {
          if (isFunction(onSuccess)) {
            onSuccess();
          }
        });
      } else {
        setSubmitting(false);
      }
    },
    [submitForm, setSubmitting, dirtyRef, onSuccess],
  );

  const onDebouncedSubmit = useMemo(
    () => debounce(
      onSubmit,
      debounceMs,
    ),
    [debounceMs, onSubmit],
  );

  useEffect(
    () => {
      dirtyRef.current = dirty;
    },
    [dirty, dirtyRef],
  );

  useEffect(
    () => {
      if (dirty) {
        if (debounceLoader) {
          setSubmitting(true);
        }
        onDebouncedSubmit();
      }
    },
    [onDebouncedSubmit, setSubmitting, values, dirty, debounceLoader],
  );

  if (isSubmitting) {
    return (
      <Box {...omitTranslationProps(rest)}>
        <CircularProgress {...circularProgressProps} />
      </Box>
    );
  }

  return null;
};

FormikAutoSave.propTypes = {
  debounceMs: PropTypes.number,
  onSuccess: PropTypes.func,
  debounceLoader: PropTypes.bool,
  circularProgressProps: PropTypes.object,
};

FormikAutoSave.defaultProps = {
  debounceMs: 300,
  debounceLoader: false,
  onSuccess: null,
  circularProgressProps: {},
};

export default FormikAutoSave;
