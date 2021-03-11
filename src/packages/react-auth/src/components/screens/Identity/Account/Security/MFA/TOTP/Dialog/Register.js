import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import PropTypes from 'prop-types';
import { Form, Field } from 'formik';

import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';
import FieldCodePasteButton from '@misakey/ui/Form/Field/Code/WithPasteButton';
import Formik from '@misakey/ui/Formik';
import { AUTOFILL_CODE } from '@misakey/ui/constants/autofill';
import BoxControls from '@misakey/ui/Box/Controls';
import DialogContent from '@misakey/ui/DialogContent';
import DialogTitleWithCloseFormik from '@misakey/ui/DialogTitle/WithCloseIcon/Formik';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import DialogActions from '@material-ui/core/DialogActions';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';

import { beginTotpEnroll, finishTotpEnroll } from '@misakey/auth/builder/identities';
import { userIdentityUpdate } from '@misakey/react-auth/store/actions/identity/account';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { totpEnrollValidationSchema } from '@misakey/react-auth/constants/validationSchemas/identity';
import { forbidden } from 'packages/ui/src/constants/errorTypes';

// CONSTANTS
const TOTP_CODE = 'code';

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    padding: 0,
  },
  prewrap: {
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  },
  img: {
    margin: theme.spacing(1),
    width: 180,
    height: 180,
  },
  loading: {
    margin: theme.spacing(4),
  },
}));

function RegisterTotpDialogContent({ onClose, identityId, onSetRecoveryCodes }) {
  const classes = useStyles();

  const { t } = useTranslation(['account', 'common']);
  const handleHttpErrors = useHandleHttpErrors();

  const dispatch = useDispatch();

  const [imageFlashCode, setImageFlashCode] = useState(null);
  const [pendingEnrollId, setPendingEnrollId] = useState(null);

  const onBeginTotpEnroll = useCallback(
    async () => {
      try {
        const { base64Image, id } = await beginTotpEnroll(identityId);
        setImageFlashCode(`data:image/jpeg;base64, ${base64Image}`);
        setPendingEnrollId(id);
      } catch (err) {
        handleHttpErrors(err);
      }
    },
    [handleHttpErrors, identityId],
  );

  const onFinishTotpEnroll = useCallback(
    async ({ [TOTP_CODE]: code }, { resetForm, setStatus }) => {
      try {
        const { recoveryCodes } = await finishTotpEnroll(identityId, {
          id: pendingEnrollId,
          code,
        });
        dispatch(userIdentityUpdate(identityId, { hasTotpSecret: true }));
        onSetRecoveryCodes(recoveryCodes);
        resetForm();
      } catch (error) {
        if (error.code === forbidden) {
          setStatus({ [TOTP_CODE]: forbidden });
          return;
        }
        handleHttpErrors(error);
      }
    },
    [pendingEnrollId, dispatch, handleHttpErrors, identityId, onSetRecoveryCodes],
  );

  const { isFetching } = useFetchEffect(onBeginTotpEnroll, { shouldFetch: isNil(imageFlashCode) });

  useEffect(() => () => {
    setImageFlashCode(null);
    setPendingEnrollId(null);
  }, []);

  return (
    <Formik
      initialValues={{ [TOTP_CODE]: '' }}
      validationSchema={totpEnrollValidationSchema}
      onSubmit={onFinishTotpEnroll}
    >
      <Form>
        <DialogTitleWithCloseFormik
          title={t('account:security.MFA.totp.dialog.title.register')}
          onClose={onClose}
        />
        <DialogContent
          classes={{ root: classes.dialogContentRoot }}
          subtitle={<Subtitle className={classes.prewrap}>{t('account:security.MFA.totp.dialog.subtitle.register')}</Subtitle>}
        >
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" width="100%">
            {isFetching && <CircularProgress className={classes.loading} />}
            {!isNil(imageFlashCode) && (
              <img
                src={imageFlashCode}
                alt="totp flashcode"
                className={classes.img}
              />
            )}
            <Field
              name={TOTP_CODE}
              component={FieldCodePasteButton}
              variant="filled"
              autoFocus
              prefix="totp."
              inputProps={{
                id: 'totp_code',
                ...AUTOFILL_CODE,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <BoxControls
            primary={{
              type: 'submit',
              text: t('common:submit'),
            }}
            formik
          />
        </DialogActions>
      </Form>
    </Formik>
  );
}

RegisterTotpDialogContent.propTypes = {
  onClose: PropTypes.func.isRequired,
  identityId: PropTypes.string.isRequired,
  onSetRecoveryCodes: PropTypes.func.isRequired,
};

export default RegisterTotpDialogContent;
