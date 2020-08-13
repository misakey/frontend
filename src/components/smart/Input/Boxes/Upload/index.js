import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import BoxesSchema from 'store/schemas/Boxes';
import { CLOSED } from 'constants/app/boxes/statuses';

import fileToBlob from '@misakey/helpers/fileToBlob';
import isFunction from '@misakey/helpers/isFunction';
import isEmpty from '@misakey/helpers/isEmpty';
import fileListToArray from '@misakey/helpers/fileListToArray';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useBoxPublicKeysWeCanDecryptFrom from 'packages/crypto/src/hooks/useBoxPublicKeysWeCanDecryptFrom';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useDrag from '@misakey/hooks/useDrag';

import UploadDialog, { BLOBS_FIELD_NAME, INITIAL_VALUES } from 'components/smart/Dialog/Boxes/Upload';
import Box from '@material-ui/core/Box';
import Title from '@misakey/ui/Typography/Title';
import Backdrop from '@material-ui/core/Backdrop';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';

// CONSTANTS
const DROP_TYPE = 'Files';

// HOOKS
const useStyles = makeStyles((theme) => ({
  dragArea: {
    width: '100%',
    height: '100%',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.secondary.main,
    pointerEvents: 'none',
    position: 'absolute',
    backgroundColor: theme.palette.grey[300],
  },
  backdropArea: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
}));

// COMPONENTS
const InputBoxesUpload = ({
  box,
  open, onClose, onSuccess,
  onUpload,
  fileTransform,
  children,
  t,
}) => {
  const [dialogInitialValues, setDialogInitialValues] = useState(INITIAL_VALUES);

  const classes = useStyles();

  const autoFocus = useMemo(
    () => dialogInitialValues === INITIAL_VALUES,
    [dialogInitialValues],
  );

  const handleDrop = useCallback(
    (e) => {
      // Prevent default behavior (Prevent file from being opened)
      e.preventDefault();
      const { items, files } = e.dataTransfer;
      let nextValue = [];
      if (files) {
        // Use DataTransfer interface to access the file(s)
        nextValue = fileListToArray(files).map(fileTransform);
        setDialogInitialValues({ [BLOBS_FIELD_NAME]: nextValue });
      } else if (items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < items.length; i += 1) {
          // If dropped items aren't files, reject them
          if (items[i].kind === 'file') {
            nextValue.push(fileTransform(items[i].getAsFile()));
          }
        }
      }
      // In case of dropping anything other than files, do not trigger file upload
      if (!isEmpty(nextValue)) {
        setDialogInitialValues({ [BLOBS_FIELD_NAME]: nextValue });
        if (isFunction(onUpload)) {
          onUpload(e);
        }
      }
    },
    [setDialogInitialValues, onUpload, fileTransform],
  );

  const handleClose = useCallback(
    (e) => {
      setDialogInitialValues(INITIAL_VALUES);
      return onClose(e);
    },
    [setDialogInitialValues, onClose],
  );

  const [dragActive, dragEvents] = useDrag({ handleDrop, type: DROP_TYPE });

  const onDragOver = useCallback(
    (e) => {
      e.preventDefault();
    },
    [],
  );

  const publicKeysWeCanEncryptWith = useBoxPublicKeysWeCanDecryptFrom();
  const { lifecycle, publicKey } = useSafeDestr(box);

  const disabled = useMemo(
    () => lifecycle === CLOSED || !publicKeysWeCanEncryptWith.has(publicKey),
    [lifecycle, publicKey, publicKeysWeCanEncryptWith],
  );

  const dragProps = useMemo(
    () => (disabled
      ? {}
      : { ...dragEvents, onDragOver }),
    [disabled, dragEvents, onDragOver],
  );

  return (
    <>
      <UploadDialog
        initialValues={dialogInitialValues}
        box={box}
        onSuccess={onSuccess}
        open={open}
        onClose={handleClose}
        autoFocus={autoFocus}
      />
      <div className={classes.dragArea} {...dragProps}>
        {dragActive ? (
          <div className={classes.backdropArea}>
            <Backdrop className={classes.backdrop} open={dragActive}>
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <CloudUploadIcon fontSize="large" />
                <Title>{t('fields:files.label')}</Title>
              </Box>
            </Backdrop>
          </div>
        ) : children}
      </div>
    </>
  );
};

InputBoxesUpload.propTypes = {
  children: PropTypes.node,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  // dialog
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  // input file
  onUpload: PropTypes.func,
  accept: PropTypes.arrayOf(PropTypes.string),
  fileTransform: PropTypes.func,
  // withTranslation
  t: PropTypes.func.isRequired,
};

InputBoxesUpload.defaultProps = {
  children: null,
  onUpload: null,
  accept: [],
  fileTransform: fileToBlob,
};

export default withTranslation(['boxes', 'fields'])(InputBoxesUpload);
