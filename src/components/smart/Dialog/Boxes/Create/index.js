import React, { useCallback, useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import routes from 'routes';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { boxNameFieldValidationSchema } from 'constants/validationSchemas/boxes';
import setBoxSecrets from '@misakey/react/crypto/store/actions/setBoxSecrets';

import { createBoxBuilder } from '@misakey/core/api/helpers/builder/boxes';
import getRandomTitle from '@misakey/core/helpers/getRandomTitle';
import isFunction from '@misakey/core/helpers/isFunction';
import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';
import logSentryException from '@misakey/core/helpers/log/sentry/exception';
import dialogIsFullScreen from '@misakey/core/helpers/dialog/isFullScreen';
import { createCryptoForNewBox } from '@misakey/core/crypto/box/creation';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';
import useOrgId from '@misakey/react/auth/hooks/useOrgId';
import useGeneratePathKeepingSearchAndHashCallback from '@misakey/hooks/useGeneratePathKeepingSearchAndHash/callback';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import BoxControls from '@misakey/ui/Box/Controls';
import DialogContent from '@misakey/ui/DialogContent';
import DialogTitleWithCloseFormik from '@misakey/ui/DialogTitle/WithCloseIcon/Formik';
import { Form, Field } from 'formik';
import Formik from '@misakey/ui/Formik';
import Dialog from '@material-ui/core/Dialog';
import FieldText from '@misakey/ui/Form/Field/TextFieldWithErrors';
import IconButtonMenuAccount from 'components/smart/IconButton/Menu/Account';
import DialogBoxesCreatePasteLink from 'components/smart/Dialog/Boxes/Create/PasteLink';

// CONSTANTS
const { hasCrypto: hasCryptoSelector } = authSelectors;
const FIELD_BOX_NAME = 'name';
const INITIAL_VALUES = { [FIELD_BOX_NAME]: '' };

const DESCRIPTION_ID = 'create-box-dialog-description';

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    padding: theme.spacing(0, 0, 1, 0),
    [dialogIsFullScreen(theme)]: {
      paddingBottom: theme.spacing(0),
    },
  },
  bold: {
    fontWeight: theme.typography.fontWeightBold,
  },
  dialogActionsRoot: {
    padding: theme.spacing(2),
  },
  inputField: { margin: theme.spacing(2, 0) },
}));

// COMPONENTS
function CreateBoxDialog({
  t,
  onClose,
  onSuccess,
  open,
  ...props
}) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const history = useHistory();
  const handleHttpErrors = useHandleHttpErrors();
  const fullScreen = useDialogFullScreen();

  const [isInvitation, setIsInvitation] = useState(false);
  const [placeholder, setPlaceholder] = useState();

  const generatePathKeepingSearchAndHashCallback = useGeneratePathKeepingSearchAndHashCallback();

  const hasCrypto = useSelector(hasCryptoSelector);

  const ownerOrgId = useOrgId();

  useEffect(
    () => {
      setPlaceholder(getRandomTitle());
    },
    [open],
  );

  const onToggleInvitation = useCallback(
    () => {
      setIsInvitation((invitation) => !invitation);
    },
    [setIsInvitation],
  );

  const onSubmitNewBoxSuccess = useCallback(
    async (newBox, secretKey, keyShare) => {
      const { id } = newBox;

      return Promise.resolve(dispatch(setBoxSecrets({ boxId: id, secretKey, keyShare })))
        .then(() => {
          if (isFunction(onSuccess)) {
            onSuccess();
          }
        })
        .catch((error) => {
          enqueueSnackbar(t('boxes:create.error.updateSecretStorage'), { variant: 'error' });
          logSentryException(error, 'dispatching setBoxSecret', { crypto: true });
        })
        .finally(() => {
          enqueueSnackbar(t('boxes:create.dialog.success'), { variant: 'success' });
          const nextTo = generatePathKeepingSearchAndHashCallback(routes.boxes.read._, { id }, null, '');
          history.push(nextTo);
          onClose();
        });
    },
    [
      dispatch, enqueueSnackbar, generatePathKeepingSearchAndHashCallback,
      history, onClose, onSuccess, t,
    ],
  );

  const onSubmitNewBox = useCallback(
    (form, { setSubmitting }) => {
      const title = form[FIELD_BOX_NAME] || placeholder;
      const {
        boxSecretKey,
        boxPublicKey,
        invitationKeyShare,
        misakeyKeyShare,
      } = createCryptoForNewBox();
      return createBoxBuilder({
        title,
        publicKey: boxPublicKey,
        keyShare: misakeyKeyShare,
        ownerOrgId,
      })
        .then((response) => onSubmitNewBoxSuccess(response, boxSecretKey, invitationKeyShare))
        .catch(handleHttpErrors)
        .finally(() => { setSubmitting(false); });
    },
    [handleHttpErrors, onSubmitNewBoxSuccess, placeholder, ownerOrgId],
  );

  const onResetFormik = useCallback(
    (e, { resetForm }) => {
      resetForm({ values: INITIAL_VALUES });
      onClose();
    },
    [onClose],
  );

  return (
    <Dialog
      fullWidth
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      aria-label={t('boxes:create.dialog.title')}
      aria-describedby={DESCRIPTION_ID}
      {...omitTranslationProps(props)}
    >
      {isInvitation || !hasCrypto
        ? (
          <DialogBoxesCreatePasteLink
            fullScreen={fullScreen}
            onClose={onClose}
            onBack={onToggleInvitation}
          />
        )
        : (
          <Formik
            validationSchema={boxNameFieldValidationSchema}
            initialValues={INITIAL_VALUES}
            onSubmit={onSubmitNewBox}
          >
            <Form>
              <DialogTitleWithCloseFormik
                id={DESCRIPTION_ID}
                title={t('boxes:create.dialog.content')}
                onClose={onResetFormik}
                fullScreen={fullScreen}
              >
                <BoxFlexFill />
                {fullScreen && (
                  <IconButtonMenuAccount />
                )}
              </DialogTitleWithCloseFormik>
              <DialogContent
                className={classes.dialogContentRoot}
              >
                <Field
                  component={FieldText}
                  className={classes.inputField}
                  name={FIELD_BOX_NAME}
                  label={t('boxes:create.dialog.fields.name')}
                  prefix="boxes."
                  autoFocus
                  id="BoxName"
                  type="text"
                  placeholder={placeholder}
                  variant="filled"
                  fullWidth
                />
                <Button
                  standing={BUTTON_STANDINGS.TEXT}
                  text={t('boxes:create.dialog.pasteLink')}
                  onClick={onToggleInvitation}
                />
                <BoxControls
                  primary={{
                    type: 'submit',
                    text: t('common:create'),
                  }}
                  formik
                />
              </DialogContent>
            </Form>
          </Formik>
        )}
    </Dialog>
  );
}

CreateBoxDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  t: PropTypes.func.isRequired,
};

CreateBoxDialog.defaultProps = {
  open: false,
  onSuccess: null,
};

export default withTranslation(['common', 'boxes'])(CreateBoxDialog);
