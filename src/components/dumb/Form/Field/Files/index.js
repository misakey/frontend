import React, { useCallback, useMemo, Fragment } from 'react';
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
import isFunction from '@misakey/helpers/isFunction';
import uniq from '@misakey/helpers/uniq';
import getEventFilesArray from '@misakey/helpers/event/getFilesArray';

import { makeStyles } from '@material-ui/core/styles';
import { useFormikContext } from 'formik';
import useFieldErrors from '@misakey/hooks/useFieldErrors';

import InputFile from '@misakey/ui/Input/File';
import Typography from '@material-ui/core/Typography';
import TypographyPreWrapped from '@misakey/ui/Typography/PreWrapped';
import BoxMessage from '@misakey/ui/Box/Message';
import FormHelperText from '@material-ui/core/FormHelperText';
import List from '@material-ui/core/List';

// HELPERS
const getFilenamesStatuses = (status) => {
  if (isNil(status)) { return {}; }
  const { errors = [], sent = [] } = groupBy(status, ({ isSent }) => (isSent ? 'sent' : 'errors'));
  return {
    filenamesErrors: errors.map(({ blob }) => `\n - ${blob.name}`),
    filenamesSent: sent.map(({ blob }) => `\n - ${blob.name}`),
  };
};

const isErrorArray = (errorKeys, index) => {
  if (!isArray(errorKeys)) {
    return false;
  }
  const indexError = errorKeys[index];
  return isArray(indexError);
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  label: {
    color: theme.palette.grey[300],
    textTransform: 'uppercase',
    textAlign: 'center',
  },
}));

// COMPONENTS
const FilesField = ({
  t,
  onUpload,
  accept,
  labelText,
  name,
  prefix,
  fileTransform,
  emptyTitle,
  uniqFn,
  renderItem,
  autoFocus,
}) => {
  const { status } = useFormikContext();
  const fieldStatus = useMemo(() => status[name], [status, name]);

  const { filenamesErrors, filenamesSent } = useMemo(
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

  const classes = useStyles();

  const onChange = useCallback(
    (e) => {
      const files = getEventFilesArray(e);
      // NB accept only same file once
      const nextValue = uniqFn(value.concat(files.map(fileTransform)));
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

  return (
    <>
      {isEmpty(value) ? emptyTitle : (
        <List dense>
          {value.map((file, index) => (
            <Fragment key={file.key}>
              {renderItem({ ...file, index, onRemove })}
              {displayError && isErrorArray(errorKeys, index) && (
                <FormHelperText error>
                  {t(errorKeys[index])}
                </FormHelperText>
              )}
            </Fragment>
          ))}
        </List>
      )}
      {!isNil(fieldStatus) && (
        <BoxMessage type="error" p={2} my={1}>
          <TypographyPreWrapped>
            {t('fields:files.error.api.notSent', { filenamesErrors })}
            {!isEmpty(filenamesSent) && (
              t('fields:files.error.api.sent', { filenamesSent })
            )}
          </TypographyPreWrapped>
        </BoxMessage>
      )}
      <InputFile
        accept={accept}
        name={name}
        onChange={onChange}
        label={(
          <Typography variant="h5" className={classes.label}>
            {labelText || t('fields:files.label')}
          </Typography>
          )}
        buttonText={t('fields:files.button.choose.label')}
        autoFocus={autoFocus}
        multiple
      />
      {displayError && isGlobalErrorKeys && (
        <FormHelperText error>
          {t(errorKeys)}
        </FormHelperText>
      )}
    </>
  );
};

FilesField.propTypes = {
  accept: PropTypes.arrayOf(PropTypes.string),
  onUpload: PropTypes.func,
  labelText: PropTypes.string,
  name: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  emptyTitle: PropTypes.node,
  fileTransform: PropTypes.func,
  uniqFn: PropTypes.func,
  renderItem: PropTypes.func.isRequired,
  autoFocus: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

FilesField.defaultProps = {
  onUpload: undefined,
  accept: [],
  emptyTitle: null,
  fileTransform: identity,
  uniqFn: uniq,
  labelText: null,
  prefix: '',
  autoFocus: false,
};

export default withTranslation(['fields'])(FilesField);
