import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Field } from 'formik';
import Formik from '@misakey/ui/Formik';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';
import { normalize } from 'normalizr';
import { useDispatch } from 'react-redux';
import { generatePath, useHistory } from 'react-router-dom';
import routes from 'routes';

import { ALL } from 'constants/app/boxes/statuses';
import BoxesSchema from 'store/schemas/Boxes';
import { boxNameFieldValidationSchema } from 'constants/validationSchemas/boxes';
import { updatePaginationsToStatus } from 'store/reducers/userBoxes/pagination';
import { receiveEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { addBoxSecretKey } from '@misakey/crypto/store/actions/concrete';

import { createBoxBuilder, getBoxMembersBuilder } from '@misakey/helpers/builder/boxes';
import getRandomTitle from '@misakey/helpers/getRandomTitle';
import isFunction from '@misakey/helpers/isFunction';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { generateAsymmetricKeyPair } from '@misakey/crypto/crypto';

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
import FieldTextStandard from 'components/dumb/Form/Field/Text/Standard';
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
    fontWeight: 'bold',
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const placeholder = useMemo(() => getRandomTitle(), [open]);

  const onToggleInvitation = useCallback(
    () => {
      setIsInvitation((invitation) => !invitation);
    },
    [setIsInvitation],
  );

  const onSubmitNewBoxSuccess = useCallback(
    async (newBox, secretKey) => {
      const { id } = newBox;
      let members = [];
      try {
        members = await getBoxMembersBuilder(id);
      } catch (e) {
        handleHttpErrors(e);
      }
      const normalized = normalize({
        members,
        ...newBox,
        hasAccess: true,
        isMember: true,
      }, BoxesSchema.entity);
      const { entities } = normalized;
      await Promise.all([
        dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
        dispatch(updatePaginationsToStatus(id, ALL)),
      ]);
      return Promise.resolve(dispatch(addBoxSecretKey(secretKey)))
        .then(() => {
          if (isFunction(onSuccess)) {
            onSuccess();
          }
        })
        .catch(() => {
          enqueueSnackbar(t('boxes:create.dialog.error.updateBackup'), { variant: 'error' });
        })
        .finally(() => {
          enqueueSnackbar(t('boxes:create.dialog.success'), { variant: 'success' });
          const nextTo = generatePath(routes.boxes.read._, { id });
          history.push(nextTo);
          onClose();
        });
    },
    [dispatch, enqueueSnackbar, history, onClose, onSuccess, t, handleHttpErrors],
  );

  const onSubmitNewBox = useCallback((form, { setSubmitting }) => {
    const title = form[FIELD_BOX_NAME] || placeholder;
    // @FIXME a component should not have to call such low-level functions,
    // see about moving part of the box creation logic to actions
    const { secretKey, publicKey } = generateAsymmetricKeyPair();
    return createBoxBuilder({ title, publicKey })
      .then((response) => onSubmitNewBoxSuccess(response, secretKey))
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
                  component={FieldTextStandard}
                  className={classes.inputField}
                  name={FIELD_BOX_NAME}
                  label={t('boxes:create.dialog.fields.name')}
                  prefix="boxes."
                  autoFocus
                  id="BoxName"
                  type="text"
                  placeholder={placeholder}
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
