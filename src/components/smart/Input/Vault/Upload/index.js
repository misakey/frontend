import React from 'react';

import PropTypes from 'prop-types';

import UploadDialog, { BLOBS_FIELD_NAME, INITIAL_VALUES, INITIAL_STATUS } from 'components/smart/Dialog/Vault/Upload';

import InputUpload from '@misakey/ui/Input/Upload';

// COMPONENTS
const InputVaultUpload = ({
  ...props
}) => (
  <InputUpload
    initialValues={INITIAL_VALUES}
    initialStatus={INITIAL_STATUS}
    dialog={UploadDialog}
    fieldName={BLOBS_FIELD_NAME}
    {...props}
  />
);

InputVaultUpload.propTypes = {
  // dialog
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default InputVaultUpload;
