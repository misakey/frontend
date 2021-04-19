import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import PropTypes from 'prop-types';

import { AUTOFILL_CODE } from '@misakey/ui/constants/autofill';
import { userIdentityUpdate } from '@misakey/react/auth/store/actions/identity/account';
import { totpEnrollValidationSchema } from '@misakey/react/auth/constants/validationSchemas/identity';
import { forbidden } from '@misakey/core/api/constants/errorTypes';

import isNil from '@misakey/core/helpers/isNil';
import { beginTotpEnroll, finishTotpEnroll } from '@misakey/core/auth/builder/identities';
import dialogIsFullScreen from '@misakey/core/helpers/dialog/isFullScreen';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

import { Form } from 'formik';
import Field from '@misakey/ui/Form/Field';
import FieldCodePasteButton from '@misakey/ui/Form/Field/Code/WithPasteButton';
import Formik from '@misakey/ui/Formik';
import BoxControlsDialog from '@misakey/ui/Box/Controls/Dialog';
import DialogContent from '@misakey/ui/DialogContent';
import DialogTitleWithCloseFormik from '@misakey/ui/DialogTitle/WithCloseIcon/Formik';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';

// CONSTANTS
const TOTP_CODE = 'code';

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    padding: theme.spacing(0, 0, 1, 0),
    [dialogIsFullScreen(theme)]: {
      paddingBottom: theme.spacing(0),
    },
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
              fullWidth
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
          <BoxControlsDialog
            mt={1}
            primary={{
              type: 'submit',
              text: t('common:submit'),
            }}
            formik
          />
        </DialogContent>
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
