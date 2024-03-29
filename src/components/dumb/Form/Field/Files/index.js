import React, { useCallback, useMemo, useRef, Fragment, useEffect } from 'react';

import PropTypes from 'prop-types';

import isNil from '@misakey/core/helpers/isNil';
import isString from '@misakey/core/helpers/isString';
import isArray from '@misakey/core/helpers/isArray';
import isEmpty from '@misakey/core/helpers/isEmpty';
import remove from '@misakey/core/helpers/remove/ramda';
import compact from '@misakey/core/helpers/compact';
import identity from '@misakey/core/helpers/identity';
import groupBy from '@misakey/core/helpers/groupBy';
import partition from '@misakey/core/helpers/partition';
import fileType from '@misakey/core/helpers/fileType';
import isFunction from '@misakey/core/helpers/isFunction';
import uniq from '@misakey/core/helpers/uniq';
import prop from '@misakey/core/helpers/prop';
import getEventFilesArray from '@misakey/core/helpers/event/getFilesArray';
import { isDesktopDevice } from '@misakey/core/helpers/devices';

import { makeStyles } from '@material-ui/core/styles';
import { useFormikContext } from 'formik';
import useFieldErrors from '@misakey/hooks/useFieldErrors';
import { useTranslation } from 'react-i18next';

import InputFile from '@misakey/ui/Input/File';
import InputFileFolder from '@misakey/ui/Input/File/Folder';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import TypographyPreWrapped from '@misakey/ui/Typography/PreWrapped';
import BoxMessage from '@misakey/ui/Box/Message';
import FormHelperText from '@material-ui/core/FormHelperText';
import List from '@material-ui/core/List';
import Box from '@material-ui/core/Box';
import Accordion from '@misakey/ui/Accordion';
import AccordionSummary from '@misakey/ui/AccordionSummary';

import FolderIcon from '@material-ui/icons/Folder';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// HELPERS
const isEmptyFileType = (file) => isEmpty(fileType(file));

const makeErrorLine = (error) => `\n - ${error}`;

const getFilenamesStatuses = (status) => {
  if (isNil(status)) { return {}; }
  const { noExtension = [], sent = [], errors = [] } = groupBy(status,
    ({ isSent, noExtension: noExtensionError }) => {
      if (noExtensionError) {
        return 'noExtension';
      }
      return isSent ? 'sent' : 'errors';
    });
  return {
    filenamesErrors: errors.map(({ blob }) => makeErrorLine(blob.name)),
    filenamesSent: sent.map(({ blob }) => makeErrorLine(blob.name)),
    filenamesNoExtension: noExtension.map(({ blob }) => makeErrorLine(blob.name)),
  };
};

const groupByFolder = (files, errorKeys, uploadStatus, defaultName) => {
  if (isEmpty(files)) {
    return [];
  }
  const filesWithMeta = files
    .map((file, index) => ({
      ...file,
      index,
      errorKeys: prop(index, errorKeys),
      uploadStatus: prop(index, uploadStatus),
    }));
  const groups = groupBy(filesWithMeta,
    ({ blob: { webkitRelativePath, name } }) => {
      const folderPath = isEmpty(webkitRelativePath)
        ? defaultName
        : webkitRelativePath.replace(`/${name}`, '');
      return folderPath;
    });

  return Object.entries(groups).map(([key, values]) => ({ key, files: values }));
};

// HOOKS
const useStyles = makeStyles(() => ({
  label: {
    textTransform: 'uppercase',
  },
}));

// COMPONENTS
const FilesField = ({
  onUpload,
  accept,
  labelFiles, labelFolder,
  name,
  prefix,
  fileTransform,
  uniqFn,
  uploadStatus,
  renderItem,
  children,
  autoFocus,
  disabled,
  flexGrow,
  ...props
}) => {
  const { t } = useTranslation(['common', 'fields']);
  const globalErrorRef = useRef();

  const { status, isSubmitting, setStatus } = useFormikContext();
  const fieldStatus = useMemo(() => status[name], [status, name]);

  const onClearStatus = useCallback(
    () => {
      setStatus({ [name]: null });
    },
    [setStatus, name],
  );

  const { filenamesErrors, filenamesSent, filenamesNoExtension } = useMemo(
    () => getFilenamesStatuses(fieldStatus),
    [fieldStatus],
  );

  const fieldConfig = useMemo(
    () => ({ name, prefix, multiple: true }),
    [name, prefix],
  );

  const {
    field: { value },
    meta: { error },
    helpers: { setValue, setTouched, setError },
    errorKeys,
    displayError,
  } = useFieldErrors(fieldConfig);

  const onClearError = useCallback(
    () => setError(null),
    [setError],
  );

  const isGlobalErrorKeys = useMemo(
    () => isArray(errorKeys)
      && !isEmpty(compact(errorKeys))
      && errorKeys.every(isString),
    [errorKeys],
  );

  const groups = useMemo(
    () => groupByFolder(value, errorKeys, uploadStatus, t('common:files')),
    [value, errorKeys, uploadStatus, t],
  );

  const classes = useStyles();

  const onChange = useCallback(
    (e) => {
      const files = getEventFilesArray(e);
      // immediately filter files without extension
      const [noExtFiles, extFiles] = partition(files, isEmptyFileType);
      // NB accept only same file once
      const nextValue = uniqFn(value.concat(extFiles.map(fileTransform)));
      if (!isEmpty(noExtFiles)) {
        setStatus({ [name]: noExtFiles.map((blob) => ({ blob, noExtension: true })) });
      } else {
        setStatus({ [name]: undefined });
      }

      setError(null);
      setValue(nextValue);
      setTouched(true);

      if (isFunction(onUpload)) {
        onUpload(e, { files: nextValue });
      }
    },
    [
      value,
      onUpload, setError, setValue, setTouched,
      fileTransform, uniqFn,
      setStatus, name,
    ],
  );

  const onRemove = useCallback(
    (index) => {
      const nextValue = remove(index, 1, value);
      setValue(nextValue);
      const nextError = isArray(error) ? remove(index, 1, error) : error;
      setError(nextError);
    },
    [value, error, setValue, setError],
  );

  const onFocusNode = useCallback(
    (node) => {
      if (!isNil(node)) {
        globalErrorRef.current = node;
        requestAnimationFrame(() => {
          node.scrollIntoView(false);
        });
      }
    },
    [globalErrorRef],
  );

  useEffect(
    () => {
      const { current } = globalErrorRef;
      if (displayError && isGlobalErrorKeys && !isNil(current)) {
        current.scrollIntoView();
      }
    },
    [isSubmitting, displayError, isGlobalErrorKeys],
  );

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        flexGrow={isDesktopDevice ? flexGrow : undefined}
        {...props}
      >
        <InputFile
          accept={accept}
          name={name}
          onChange={onChange}
          label={(
            <Title
              color="textSecondary"
              gutterBottom={false}
              align="center"
              className={classes.label}
            >
              {labelFiles || t('fields:files.label')}
            </Title>
          )}
          buttonText={(
            <>
              {t('fields:files.button.choose.label')}
              <InsertDriveFileIcon />
            </>
          )}
          autoFocus={autoFocus}
          multiple
          disabled={isSubmitting || disabled}
        />
        {isDesktopDevice && (
        <InputFileFolder
          accept={accept}
          name={name}
          onChange={onChange}
          label={(
            <Title color="textSecondary" gutterBottom={false} align="center" className={classes.label}>
              {labelFolder || t('fields:folder.label')}
            </Title>
              )}
          buttonText={(
            <>
              {t('fields:files.button.choose.label')}
              <FolderIcon />
            </>
              )}
          multiple
          disabled={isSubmitting || disabled}
        />
        )}
      </Box>
      {children}
      {!isNil(fieldStatus) && (
        <BoxMessage type="error" p={2} my={1} ref={onFocusNode} onClose={onClearStatus}>
          <TypographyPreWrapped>
            {!isEmpty(filenamesErrors) && (
              t('fields:files.error.api.notSent', { filenamesErrors })
            )}
            {!isEmpty(filenamesSent) && (
              t('fields:files.error.api.sent', { filenamesSent })
            )}
            {!isEmpty(filenamesNoExtension) && (
              t('fields:files.error.extension', { filenamesNoExtension })
            )}
          </TypographyPreWrapped>
        </BoxMessage>
      )}
      {displayError && isGlobalErrorKeys && (
        <BoxMessage type="error" p={2} my={1} ref={onFocusNode} onClose={onClearError}>
          <TypographyPreWrapped>
            {t(errorKeys)}
          </TypographyPreWrapped>
        </BoxMessage>
      )}
      {groups.map(({ key, files }) => (
        <Accordion
          key={key}
          defaultExpanded
          elevation={0}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
          >
            <Subtitle>{key}</Subtitle>
            <Box ml={1}>
              <Subtitle>
                (
                {files.length}
                )
              </Subtitle>
            </Box>
          </AccordionSummary>
          <List dense>
            {files.map(({ errorKeys: fileErrorKeys, index, ...file }) => (
              <Fragment key={file.key}>
                {renderItem({ ...file, index, onRemove })}
                {displayError && isArray(errorKeys) && (
                  <FormHelperText error>
                    {t(fileErrorKeys)}
                  </FormHelperText>
                )}
              </Fragment>
            ))}
          </List>
        </Accordion>
      ))}
    </>
  );
};

FilesField.propTypes = {
  accept: PropTypes.arrayOf(PropTypes.string),
  onUpload: PropTypes.func,
  labelFiles: PropTypes.string,
  labelFolder: PropTypes.string,
  name: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  fileTransform: PropTypes.func,
  uniqFn: PropTypes.func,
  uploadStatus: PropTypes.object,
  renderItem: PropTypes.func.isRequired,
  children: PropTypes.node,
  autoFocus: PropTypes.bool,
  disabled: PropTypes.bool,
  flexGrow: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

FilesField.defaultProps = {
  onUpload: undefined,
  accept: [],
  fileTransform: identity,
  uniqFn: uniq,
  uploadStatus: {},
  labelFiles: null,
  labelFolder: null,
  prefix: '',
  autoFocus: false,
  disabled: false,
  children: null,
  flexGrow: null,
};

export default FilesField;
