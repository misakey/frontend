import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Field } from 'formik';
import Formik from '@misakey/ui/Formik';
import { useSnackbar } from 'notistack';
import { withTranslation, Trans } from 'react-i18next';
import { normalize } from 'normalizr';
import { useDispatch } from 'react-redux';
import { generatePath, useHistory } from 'react-router-dom';
import routes from 'routes';

import { SIDES } from '@misakey/ui/constants/drawers';
import { ALL } from 'constants/app/boxes/statuses';
import BoxesSchema from 'store/schemas/Boxes';
import { boxNameFieldValidationSchema } from 'constants/validationSchemas/boxes';
import { updatePaginationsToStatus } from 'store/reducers/userBoxes/pagination';
import { receiveEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { addBoxSecretKey } from '@misakey/crypto/store/actions/concrete';

import isFunction from '@misakey/helpers/isFunction';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import { createBoxBuilder } from '@misakey/helpers/builder/boxes';
import getRandomTitle from '@misakey/helpers/getRandomTitle';
import { generateAsymmetricKeyPair } from '@misakey/crypto/crypto';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useIsUserOnWhitelist from '@misakey/hooks/useIsUserOnWhitelist';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import Dialog from '@material-ui/core/Dialog';
import Link from '@material-ui/core/Link';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import DialogTitleWithCloseFormik from '@misakey/ui/DialogTitle/WithCloseIcon/Formik';
import DialogContent from '@misakey/ui/DialogContent';
import Box from '@material-ui/core/Box';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import Title from '@misakey/ui/Typography/Title';
import Typography from '@material-ui/core/Typography';
import BoxControls from '@misakey/ui/Box/Controls';
import FieldTextStandard from 'components/dumb/Form/Field/Text/Standard';
import DialogBoxesCreatePasteLink from 'components/smart/Dialog/Boxes/Create/PasteLink';
import OpenDrawerAccountButton from 'components/smart/Button/Drawer/Account';

// CONSTANTS
export const FIELD_NAME = 'name';
export const INITIAL_VALUES = { [FIELD_NAME]: '' };
const DIALOG_CONTENT_PROPS = { alignItems: 'center' };

const DESCRIPTION_ID = 'create-box-dialog-description';

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    padding: theme.spacing(0),
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
  const isUserAuthorizedToCreateABox = useIsUserOnWhitelist();

  const [isInvitation, setIsInvitation] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const placeholder = useMemo(() => getRandomTitle(), [open]);

  const onToggleInvitation = useCallback(
    () => {
      setIsInvitation((invitation) => !invitation);
    },
    [setIsInvitation],
  );

  const onSubmitSuccess = useCallback(
    async (newBox, secretKey) => {
      const { id } = newBox;
      const normalized = normalize(newBox, BoxesSchema.entity);
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
    [dispatch, enqueueSnackbar, history, onClose, onSuccess, t],
  );

  const onSubmit = useCallback((form, { setSubmitting }) => {
    const title = form[FIELD_NAME] || placeholder;
    // @FIXME a component should not have to call such low-level functions,
    // see about moving part of the box creation logic to actions
    const { secretKey, publicKey } = generateAsymmetricKeyPair();
    return createBoxBuilder({ title, publicKey })
      .then((response) => onSubmitSuccess(response, secretKey))
      .catch(handleHttpErrors)
      .finally(() => { setSubmitting(false); });
  }, [handleHttpErrors, onSubmitSuccess, placeholder]);

  const onResetFormik = useCallback(
    (e, { resetForm }) => {
      resetForm({ values: INITIAL_VALUES });
      onClose();
    },
    [onClose],
  );

  if (!isUserAuthorizedToCreateABox) {
    return (
      <Dialog
        fullWidth
        fullScreen={fullScreen}
        open={open}
        onClose={onClose}
        aria-labelledby="create-box-dialog-title"
        aria-describedby={DESCRIPTION_ID}
        {...omitTranslationProps(props)}
      >
        <DialogTitleWithClose onClose={onClose} fullScreen={fullScreen} gutterBottom />
        <DialogContent
          className={classes.dialogContentRoot}
          contentProps={DIALOG_CONTENT_PROPS}
          title={<Typography id="create-box-dialog-title" variant="h3" align="center" gutterBottom>{t('boxes:create.notOnTheList.title')}</Typography>}
          subtitle={<Typography id={DESCRIPTION_ID} align="center" variant="h5">{t('boxes:create.notOnTheList.subtitle')}</Typography>}
        >
          <Box display="flex" justifyContent="center" my={3}>
            <Button
              standing={BUTTON_STANDINGS.MAIN}
              text={t('boxes:create.notOnTheList.button')}
              href={window.env.VALIDATE_INVITATION_CODE_URL}
            />
          </Box>
          <Typography align="center" variant="h4" gutterBottom>{t('boxes:create.notOnTheList.getCodeTitle')}</Typography>
          <Typography align="center" paragraph>
            <Trans i18nKey="boxes:create.notOnTheList.getCodeDescription">
              We regularly send information about the next distributions of invitations
              by email to the members of the community. You can join the community by
              <Link href={window.env.EARLY_BIRDS_MISAKEY_CHAT_URL} color="secondary">
                joining this Misakey chat.
              </Link>
              <br />
              <br />
              You will be able to discuss the project and try a small portion of the app
              to give us your early feedbacks.
            </Trans>
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

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
            onSubmit={onSubmit}
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
                  name={FIELD_NAME}
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
