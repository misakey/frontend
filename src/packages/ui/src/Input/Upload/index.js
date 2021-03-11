import React, { useState, useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { ACCEPTED_TYPES } from '@misakey/ui/constants/file/image';
import { DATETIME_EXTRA_SHORT } from '@misakey/ui/constants/formats/dates';

import moment from 'moment';
import partition from '@misakey/helpers/partition';
import fileToBlob from '@misakey/helpers/fileToBlob';
import fileType from '@misakey/helpers/fileType';
import makeCompatFile from '@misakey/helpers/makeCompatFile';
import isFunction from '@misakey/helpers/isFunction';
import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import capitalize from '@misakey/helpers/capitalize';
import fileListToArray from '@misakey/helpers/fileListToArray';
import logSentryException from '@misakey/helpers/log/sentry/exception';
import clipboardGetItem from '@misakey/helpers/clipboard/getItem';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useDrag from '@misakey/hooks/useDrag';
import usePasteEffect from '@misakey/hooks/usePasteEffect';

import Box from '@material-ui/core/Box';
import Title from '@misakey/ui/Typography/Title';
import Backdrop from '@material-ui/core/Backdrop';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';

// CONSTANTS
const DROP_TYPE = 'Files';
const TYPE_REGEX = /^([^/]*)\/(.*)$/;

// HELPERS
const isEmptyFileType = (file) => isEmpty(fileType(file));

const getKindAndExtensionFromType = (type) => {
  const [, kind, extension] = type.match(TYPE_REGEX);
  return { kind, extension };
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  dragArea: {
    width: '100%',
    height: '100%',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
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
const InputUpload = ({
  open, disabled,
  onClose, onSuccess, onUpload,
  fileTransform,
  children,
  dialog: Dialog,
  dialogProps,
  fieldName,
  initialValues,
  initialStatus,
  ...props
}) => {
  const [dialogInitialValues, setDialogInitialValues] = useState(initialValues);
  const [dialogInitialStatus, setDialogInitialStatus] = useState(initialStatus);

  const { t } = useTranslation('fields');
  const classes = useStyles();

  const handlePaste = useCallback(
    async (items) => {
      const item = await clipboardGetItem(items, ACCEPTED_TYPES);
      if (!isNil(item)) {
        const { type } = item;
        const { kind, extension } = getKindAndExtensionFromType(type);
        const blobName = t('fields:file.pasted.label', {
          datetime: moment().format(DATETIME_EXTRA_SHORT),
          kind: capitalize(kind),
          extension,
        });
        const file = await makeCompatFile(item, blobName, type);
        setDialogInitialValues({ [fieldName]: [fileTransform(file)] });
        if (isFunction(onUpload)) {
          onUpload();
        }
      }
    },
    [fieldName, fileTransform, onUpload, t],
  );

  const handleDrop = useCallback(
    (e) => {
      // Prevent default behavior (Prevent file from being opened)
      e.preventDefault();
      const { items, files } = e.dataTransfer;
      let nextFiles = [];
      if (files) {
        // Use DataTransfer interface to access the file(s)
        nextFiles = fileListToArray(files);
      } else if (items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < items.length; i += 1) {
          // If dropped items aren't files, reject them
          if (items[i].kind === 'file') {
            nextFiles.push(items[i].getAsFile());
          }
        }
      }
      const [noExtFiles, extFiles] = partition(nextFiles, isEmptyFileType);

      const nextValue = extFiles.map(fileTransform);
      // In case of dropping anything other than files, do not trigger file upload
      if (!isEmpty(nextFiles)) {
        if (!isEmpty(noExtFiles)) {
          setDialogInitialStatus({
            [fieldName]: noExtFiles
              .map((blob) => ({ blob, noExtension: true })),
          });
        }
        if (!isEmpty(nextValue)) {
          setDialogInitialValues({ [fieldName]: nextValue });
        }
        if (isFunction(onUpload)) {
          onUpload(e);
        }
      }
    },
    [fileTransform, onUpload, fieldName],
  );

  const handleClose = useCallback(
    (e) => {
      setDialogInitialValues(initialValues);
      setDialogInitialStatus(initialStatus);
      return onClose(e);
    },
    [initialValues, initialStatus, onClose],
  );

  const [dragActive, dragEvents] = useDrag({ handleDrop, type: DROP_TYPE });

  const onDragOver = useCallback(
    (e) => {
      e.preventDefault();
    },
    [],
  );
  const dragProps = useMemo(
    () => (disabled
      ? {}
      : { ...dragEvents, onDragOver }),
    [disabled, dragEvents, onDragOver],
  );

  // @FIXME do we want to log paste errors to sentry ?
  usePasteEffect({ onPaste: handlePaste, onError: logSentryException });

  return (
    <>
      <Dialog
        initialValues={dialogInitialValues}
        initialStatus={dialogInitialStatus}
        onSuccess={onSuccess}
        open={open}
        onClose={handleClose}
        {...dialogProps}
      />
      <Box className={classes.dragArea} {...dragProps} {...props}>
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
      </Box>
    </>
  );
};

InputUpload.propTypes = {
  children: PropTypes.node,
  dialog: PropTypes.elementType.isRequired,
  // dialog
  initialValues: PropTypes.object.isRequired,
  initialStatus: PropTypes.object.isRequired,
  fieldName: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  dialogProps: PropTypes.object,
  // input file
  onUpload: PropTypes.func,
  accept: PropTypes.arrayOf(PropTypes.string),
  fileTransform: PropTypes.func,
};

InputUpload.defaultProps = {
  dialogProps: {},
  children: null,
  disabled: false,
  onUpload: null,
  accept: [],
  fileTransform: fileToBlob,
  onSuccess: null,
};

export default InputUpload;
