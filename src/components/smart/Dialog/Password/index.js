
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';

import errorTypes from '@misakey/ui/constants/errorTypes';
import { openVaultValidationSchema } from 'constants/validationSchemas/auth';
import { PREHASHED_PASSWORD } from '@misakey/auth/constants/method';

import resolveAny from '@misakey/helpers/resolveAny';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isFunction from '@misakey/helpers/isFunction';

import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import FormField from '@misakey/ui/Form/Field';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitleWithCloseIcon from '@misakey/ui/DialogTitle/WithCloseIcon';
import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';
import BoxControls from '@misakey/ui/Box/Controls';
import Box from '@material-ui/core/Box';

// CONSTANTS
const { invalid } = errorTypes;

const INITIAL_VALUES = {
  [PREHASHED_PASSWORD]: '',
};
// HOOKS
const useStyles = makeStyles((theme) => ({
  inputField: { width: '70%', margin: theme.spacing(2, 0) },
}));

// COMPONENTS
const DialogPassword = ({
  title, contentText,
  onClose, onSubmit, open,
  submitText,
  formikProps,
  isLoading,
  t, ...rest
}) => {
  const fullScreen = useDialogFullScreen();
  const classes = useStyles();

  const handleSubmit = useCallback(
    (values, { setFieldError, ...props }) => resolveAny(
      onSubmit(values, { setFieldError, ...props }),
    )
      .catch(() => {
        setFieldError(PREHASHED_PASSWORD, invalid);
      }),
    [onSubmit],
  );

  return (
    <Dialog
      open={open}
      fullScreen={fullScreen}
      onClose={onClose}
      {...omitTranslationProps(rest)}
    >
      <Formik
        onSubmit={handleSubmit}
        initialValues={INITIAL_VALUES}
        validationSchema={openVaultValidationSchema}
        {...formikProps}
      >
        <Form>
          {isFunction(onClose) && (
            <DialogTitleWithCloseIcon title={title} onClose={onClose} />
          )}
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {contentText}
            </DialogContentText>
            <Box display="flex" justifyContent="center">
              <FormField
                name={PREHASHED_PASSWORD}
                component={FieldTextPasswordRevealable}
                className={classes.inputField}
                inputProps={{ 'data-matomo-ignore': true }}
                fullWidth={false}
                autoFocus
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <BoxControls
              primary={{
                type: 'submit',
                text: submitText || t('common:validate'),
                isLoading,
              }}
              formik
            />
          </DialogActions>
        </Form>
      </Formik>
    </Dialog>
  );
};

DialogPassword.propTypes = {
  title: PropTypes.node,
  contentText: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  open: PropTypes.bool,
  formikProps: PropTypes.object,
  submitText: PropTypes.string,
  isLoading: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

DialogPassword.defaultProps = {
  title: null,
  contentText: null,
  open: false,
  submitText: null,
  formikProps: {},
  isLoading: false,
};

export default withTranslation(['fields', 'common'])(DialogPassword);
