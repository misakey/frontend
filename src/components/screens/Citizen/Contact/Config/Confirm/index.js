import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useFormikContext } from 'formik';

import API from '@misakey/api';
import errorTypes from '@misakey/ui/constants/errorTypes';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import { getCode } from '@misakey/helpers/apiError';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import makeStyles from '@material-ui/core/styles/makeStyles';

import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Subtitle from 'components/dumb/Typography/Subtitle';
import BoxControls from 'components/dumb/Box/Controls';
import FieldCode from 'components/dumb/Form/Field/Code';
import Fields from '@misakey/ui/Form/Fields';
import ChipUser from 'components/dumb/Chip/User';
import Box from '@material-ui/core/Box';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// CONSTANTS
const DEFAULT_FIELDS = {
  code: {
    component: FieldCode,
    autoFocus: true,
  },
};
const ASK_CONFIRM_ENDPOINT = {
  method: 'POST',
  path: '/user-emails/confirm/ask',
  auth: true,
};
const { conflict } = errorTypes;

// HELPERS
const fetchAskConfirm = (form) => API
  .use(ASK_CONFIRM_ENDPOINT)
  .build(undefined, objectToSnakeCase(form))
  .send();


// HOOKS
const useStyles = makeStyles(() => ({
  buttonRoot: {
    width: 'auto',
  },
}));


// COMPONENTS
const ContactConfigConfirmFormFields = (fields) => (
  <Fields fields={fields} prefix="contactConfigConfirm." defaultFields={DEFAULT_FIELDS} />
);

ContactConfigConfirmFormFields.defaultProps = DEFAULT_FIELDS;


const ContactConfigConfirm = ({ t, profile }) => {
  const classes = useStyles();
  const handleHttpErrors = useHandleHttpErrors();
  const { enqueueSnackbar } = useSnackbar();

  const [isSending, setSending] = useState(false);

  const { values: { userEmailId, email }, setTouched } = useFormikContext();

  const reSendConfirmCode = useCallback(
    () => {
      setSending(true);

      fetchAskConfirm({ userEmailId })
        .then(() => {
          const text = t('citizen:contact.configure.confirm.resend.success', { email });
          enqueueSnackbar(text, { variant: 'success' });
        })
        .catch((e) => {
          const errorCode = getCode(e);
          if (errorCode === conflict) {
            enqueueSnackbar(t('fields:contactConfigConfirm.code.error.conflict'), { variant: 'error' });
          } else {
            handleHttpErrors(e);
          }
        })
        .finally(() => setSending(false));
    },
    [userEmailId, email, handleHttpErrors, t, enqueueSnackbar],
  );

  const signUpConfirmContentAction = useMemo(
    () => ({
      onClick: reSendConfirmCode,
      isLoading: isSending,
      disabled: isSending,
      text: t('citizen:contact.configure.confirm.resend.button'),
    }),
    [isSending, reSendConfirmCode, t],
  );

  useEffect(
    () => {
      setTouched({ type: true, email: true });
    },
    [setTouched],
  );

  return (
    <>
      <DialogContent>
        <Subtitle>
          {t('citizen:contact.configure.confirm.subtitle')}
        </Subtitle>
        <Box display="flex" justifyContent="center" mb={1}>
          <ChipUser
            label={email}
            {...profile}
          />
        </Box>
        <Box display="flex" justifyContent="center">
          <ContactConfigConfirmFormFields />
        </Box>
        <Button
          standing={BUTTON_STANDINGS.TEXT}
          classes={{ buttonRoot: classes.buttonRoot }}
          {...signUpConfirmContentAction}
        />
      </DialogContent>
      <DialogActions>
        <BoxControls
          primary={{
            type: 'submit',
            text: t('common:next'),
          }}
          formik
        />
      </DialogActions>
    </>
  );
};

ContactConfigConfirm.propTypes = {
  t: PropTypes.func.isRequired,
  profile: PropTypes.shape({
    avatarUri: PropTypes.string,
    displayName: PropTypes.string,
  }),
};

ContactConfigConfirm.defaultProps = {
  profile: {},
};

// CONNECT
const mapStateToProps = (state) => ({
  profile: state.auth.profile,
});

export default connect(mapStateToProps, {})(withTranslation(['citizen', 'fields'])(ContactConfigConfirm));
