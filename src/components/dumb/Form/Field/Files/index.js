import { useCallback, useMemo, useRef, Fragment, useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';
import isString from '@misakey/helpers/isString';
import isArray from '@misakey/helpers/isArray';
import isEmpty from '@misakey/helpers/isEmpty';
import remove from '@misakey/helpers/remove/ramda';
import compact from '@misakey/helpers/compact';
import identity from '@misakey/helpers/identity';
import groupBy from '@misakey/helpers/groupBy';
import partition from '@misakey/helpers/partition';
import fileType from '@misakey/helpers/fileType';
import isFunction from '@misakey/helpers/isFunction';
import uniq from '@misakey/helpers/uniq';
import prop from '@misakey/helpers/prop';
import getEventFilesArray from '@misakey/helpers/event/getFilesArray';
import { isDesktopDevice } from '@misakey/helpers/devices';

import { makeStyles } from '@material-ui/core/styles';
import { useFormikContext } from 'formik';
import useFieldErrors from '@misakey/hooks/useFieldErrors';

import InputFile from '@misakey/ui/Input/File';
import InputFileFolder from '@misakey/ui/Input/File/Folder';
import Typography from '@material-ui/core/Typography';
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
const useStyles = makeStyles((theme) => ({
  label: {
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
}));

// COMPONENTS
const FilesField = ({
  t,
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
}) => {
  const globalErrorRef = useRef();

  const { status, isSubmitting, setStatus } = useFormikContext();
  const fieldStatus = useMemo(() => status[name], [status, name]);

  const clearStatus = useCallback(
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
          node.scrollIntoView();
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
      {!isNil(fieldStatus) && (
        <BoxMessage type="error" p={2} my={1} ref={onFocusNode} onClose={clearStatus}>
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
        <BoxMessage type="error" p={2} my={1} ref={onFocusNode} onClose={clearStatus}>
          <TypographyPreWrapped>
            {t(errorKeys)}
          </TypographyPreWrapped>
        </BoxMessage>
      )}
      <Box display="flex" flexDirection="row">
        <InputFile
          accept={accept}
          name={name}
          onChange={onChange}
          label={(
            <Typography variant="h5" className={classes.label}>
              {labelFiles || t('fields:files.label')}
            </Typography>
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
        <Box ml={1}>
          <InputFileFolder
            accept={accept}
            name={name}
            onChange={onChange}
            label={(
              <Typography variant="h5" className={classes.label}>
                {labelFolder || t('fields:folder.label')}
              </Typography>
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
        </Box>
        )}
      </Box>
      {children}
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
  // withTranslation
  t: PropTypes.func.isRequired,
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
};

export default withTranslation(['fields', 'common'])(FilesField);
