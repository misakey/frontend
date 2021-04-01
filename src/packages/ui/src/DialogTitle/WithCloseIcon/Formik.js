import React, { useCallback } from 'react';

import PropTypes from 'prop-types';

import isFunction from '@misakey/core/helpers/isFunction';

import { useFormikContext } from 'formik';

import DialogTitleWithCloseIcon from '@misakey/ui/DialogTitle/WithCloseIcon';

const DialogTitleWithCloseIconFormik = ({ onClose, ...props }) => {
  const formikBag = useFormikContext();

  const handleClose = useCallback(
    (e) => {
      if (isFunction(onClose)) {
        onClose(e, formikBag);
      }
    },
    [onClose, formikBag],
  );

  return <DialogTitleWithCloseIcon onClose={handleClose} {...props} />;
};

DialogTitleWithCloseIconFormik.propTypes = {
  onClose: PropTypes.func,
};

DialogTitleWithCloseIconFormik.defaultProps = {
  onClose: null,
};

export default DialogTitleWithCloseIconFormik;
