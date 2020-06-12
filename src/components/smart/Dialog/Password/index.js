
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import errorTypes from '@misakey/ui/constants/errorTypes';
import { openVaultValidationSchema } from 'constants/validationSchemas/auth';

import resolveAny from '@misakey/helpers/resolveAny';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import { Form, Field } from 'formik';
import Formik from '@misakey/ui/Formik';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitleWithCloseIcon from '@misakey/ui/DialogTitle/WithCloseIcon';
import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';
import BoxControls from '@misakey/ui/Box/Controls';

// CONSTANTS
const { invalid } = errorTypes;
const PASSWORD_KEY = 'password';

const INITIAL_VALUES = {
  [PASSWORD_KEY]: '',
};

// COMPONENTS
const DialogPassword = ({
  title, contentText,
  onClose, onSubmit, open,
  initialPasswordError,
  formikProps,
  t, ...rest
}) => {
  const fullScreen = useDialogFullScreen();

  // Used with PromptPasswordProvider
  const initialErrors = useMemo(
    () => ({ [PASSWORD_KEY]: initialPasswordError }), [initialPasswordError],
  );

  const handleSubmit = useCallback(
    (values, { setFieldError }) => resolveAny(onSubmit(values))
      .catch(() => {
        setFieldError(PASSWORD_KEY, invalid);
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
        initialErrors={initialErrors}
        validationSchema={openVaultValidationSchema.password}
        {...formikProps}
      >
        <Form>
          <DialogTitleWithCloseIcon onClose={onClose}>
            {title}
          </DialogTitleWithCloseIcon>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {contentText}
            </DialogContentText>
            <Field
              name="password"
              label={t('fields:password.label')}
              placeholder={t('fields:password.placeholder')}
              component={FieldTextPasswordRevealable}
              inputProps={{ 'data-matomo-ignore': true }}
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <BoxControls
              primary={{
                type: 'submit',
                text: t('common:validate'),
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
  initialPasswordError: PropTypes.string,
  formikProps: PropTypes.object,
  // withTranslation
  t: PropTypes.func.isRequired,
};

DialogPassword.defaultProps = {
  title: null,
  contentText: null,
  open: false,
  initialPasswordError: null,
  formikProps: {},
};

export default withTranslation(['fields', 'common'])(DialogPassword);
