import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { isDesktopDevice } from '@misakey/core/helpers/devices';

import BoxesSchema from 'store/schemas/Boxes';
import isNil from '@misakey/core/helpers/isNil';

import { selectors as cryptoSelectors } from '@misakey/react/crypto/store/reducers';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import UploadDialog, { BLOBS_FIELD_NAME, INITIAL_VALUES, INITIAL_STATUS } from 'components/smart/Dialog/Boxes/Upload';

import InputUpload from '@misakey/ui/Input/Upload';

// CONSTANTS
const {
  makeGetAsymSecretKey,
} = cryptoSelectors;

// COMPONENTS
const InputBoxesUpload = ({
  box,
  ...props
}) => {
  const { publicKey } = useSafeDestr(box);
  const getAsymSecretKey = useMemo(
    () => makeGetAsymSecretKey(),
    [],
  );
  const secretKey = useSelector((state) => getAsymSecretKey(state, publicKey));

  const disabled = useMemo(
    () => isNil(secretKey),
    [secretKey],
  );

  const dialogProps = useMemo(
    () => ({
      box,
      autoFocus: !isDesktopDevice,
    }),
    [box],
  );

  return (
    <InputUpload
      initialValues={INITIAL_VALUES}
      initialStatus={INITIAL_STATUS}
      disabled={disabled}
      dialogProps={dialogProps}
      dialog={UploadDialog}
      fieldName={BLOBS_FIELD_NAME}
      {...props}
    />
  );
};

InputBoxesUpload.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  // dialog
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default InputBoxesUpload;
