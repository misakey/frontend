import React, { useCallback, useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { Form, Field } from 'formik';
import Formik from '@misakey/ui/Formik';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { generatePath, useHistory } from 'react-router-dom';
import routes from 'routes';

import { boxNameFieldValidationSchema } from 'constants/validationSchemas/boxes';
import setBoxSecrets from '@misakey/crypto/store/actions/setBoxSecrets';

import { createBoxBuilder } from '@misakey/helpers/builder/boxes';
import getRandomTitle from '@misakey/helpers/getRandomTitle';
import isFunction from '@misakey/helpers/isFunction';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { createCryptoForNewBox } from '@misakey/crypto/box/creation';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { SIDES } from '@misakey/ui/constants/drawers';

import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import BoxControls from '@misakey/ui/Box/Controls';
import DialogContent from '@misakey/ui/DialogContent';
import DialogTitleWithCloseFormik from '@misakey/ui/DialogTitle/WithCloseIcon/Formik';
import FooterFullScreen from '@misakey/ui/Footer/FullScreen';
import Title from '@misakey/ui/Typography/Title';


import Dialog from '@material-ui/core/Dialog';
import FieldText from '@misakey/ui/Form/Field/TextFieldWithErrors';
import OpenDrawerAccountButton from 'components/smart/Button/Drawer/Account';
import DialogBoxesCreatePasteLink from 'components/smart/Dialog/Boxes/Create/PasteLink';

// CONSTANTS
const FIELD_BOX_NAME = 'name';
const INITIAL_VALUES = { [FIELD_BOX_NAME]: '' };

const DESCRIPTION_ID = 'create-box-dialog-description';

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    padding: theme.spacing(0),
    marginTop: theme.spacing(3),
  },
  bold: {
    fontWeight: theme.typography.fontWeightBold,
  },
  dialogActionsRoot: {
    padding: theme.spacing(2),
  },
  inputField: { margin: theme.spacing(2, 0) },
}));

function CreateBoxDialog({
  t,
  onClose,
  onSuccess,
  open,
  fullScreen,
  ...props
}) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const history = useHistory();
  const handleHttpErrors = useHandleHttpErrors();

  const [isInvitation, setIsInvitation] = useState(false);
  const [placeholder, setPlaceholder] = useState();

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
        .catch(() => {
          enqueueSnackbar(t('boxes:create.error.updateBackup'), { variant: 'error' });
        })
        .finally(() => {
          enqueueSnackbar(t('boxes:create.dialog.success'), { variant: 'success' });
          const nextTo = generatePath(routes.boxes.read._, { id });
          history.push(nextTo);
          onClose();
        });
    },
    [dispatch, enqueueSnackbar, history, onClose, onSuccess, t],
  );

  const onSubmitNewBox = useCallback((form, { setSubmitting }) => {
    const title = form[FIELD_BOX_NAME] || placeholder;
    const {
      boxSecretKey,
      boxPublicKey,
      invitationKeyShare,
      misakeyKeyShare,
    } = createCryptoForNewBox();
    return createBoxBuilder({ title, publicKey: boxPublicKey, keyShare: misakeyKeyShare })
      .then((response) => onSubmitNewBoxSuccess(response, boxSecretKey, invitationKeyShare))
      .catch(handleHttpErrors)
      .finally(() => { setSubmitting(false); });
  }, [handleHttpErrors, onSubmitNewBoxSuccess, placeholder]);

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
      {isInvitation
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
                onClose={onResetFormik}
                fullScreen={fullScreen}
                gutterBottom
              >
                <BoxFlexFill />
                <OpenDrawerAccountButton side={SIDES.RIGHT} />
              </DialogTitleWithCloseFormik>
              <DialogContent
                className={classes.dialogContentRoot}
                title={<Title id={DESCRIPTION_ID}>{t('boxes:create.dialog.content')}</Title>}
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
      {fullScreen ? <FooterFullScreen /> : null}
    </Dialog>
  );
}

CreateBoxDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  fullScreen: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

CreateBoxDialog.defaultProps = {
  open: false,
  onSuccess: null,
  fullScreen: true,
};

export default withTranslation(['common', 'boxes'])(CreateBoxDialog);
