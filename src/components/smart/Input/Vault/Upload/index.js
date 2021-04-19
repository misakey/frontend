import React, { useMemo } from 'react';

import PropTypes from 'prop-types';

import { isDesktopDevice } from '@misakey/core/helpers/devices';


import UploadDialog, { BLOBS_FIELD_NAME, INITIAL_VALUES, INITIAL_STATUS } from 'components/smart/Dialog/Vault/Upload';

import InputUpload from '@misakey/ui/Input/Upload';

// COMPONENTS
const InputVaultUpload = ({
  ...props
}) => {
  const dialogProps = useMemo(
    () => ({
      autoFocus: !isDesktopDevice,
    }),
    [],
  );

  return (
    <InputUpload
      initialValues={INITIAL_VALUES}
      initialStatus={INITIAL_STATUS}
      dialog={UploadDialog}
      dialogProps={dialogProps}
      fieldName={BLOBS_FIELD_NAME}
      {...props}
    />
  );
};

InputVaultUpload.propTypes = {
  // dialog
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default InputVaultUpload;
