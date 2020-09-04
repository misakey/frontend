import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Field } from 'formik';
import Formik from '@misakey/ui/Formik';
import { useSnackbar } from 'notistack';
import { withTranslation, Trans } from 'react-i18next';
import { normalize } from 'normalizr';
import { useDispatch, useSelector } from 'react-redux';
import { generatePath, useHistory } from 'react-router-dom';
import routes from 'routes';

import { ALL } from 'constants/app/boxes/statuses';
import BoxesSchema from 'store/schemas/Boxes';
import { boxNameFieldValidationSchema } from 'constants/validationSchemas/boxes';
import { couponValidationSchema } from 'constants/validationSchemas/identity';
import { updatePaginationsToStatus } from 'store/reducers/userBoxes/pagination';
import { receiveEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { addBoxSecretKey } from '@misakey/crypto/store/actions/concrete';

import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import { getDetails } from '@misakey/helpers/apiError';
import { createBoxBuilder, getBoxMembersBuilder } from '@misakey/helpers/builder/boxes';
import { addCoupon } from '@misakey/helpers/builder/identities';
import getRandomTitle from '@misakey/helpers/getRandomTitle';
import isFunction from '@misakey/helpers/isFunction';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { generateAsymmetricKeyPair } from '@misakey/crypto/crypto';
import prop from '@misakey/helpers/prop';
import propOr from '@misakey/helpers/propOr';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useDispatchUpdateIdentity from 'hooks/useDispatchUpdateIdentity';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { SIDES } from '@misakey/ui/constants/drawers';
import errorTypes from '@misakey/ui/constants/errorTypes';

import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import BoxControls from '@misakey/ui/Box/Controls';
import DialogContent from '@misakey/ui/DialogContent';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import DialogTitleWithCloseFormik from '@misakey/ui/DialogTitle/WithCloseIcon/Formik';
import FooterFullScreen from '@misakey/ui/Footer/FullScreen';
import Title from '@misakey/ui/Typography/Title';

import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import FieldTextStandard from 'components/dumb/Form/Field/Text/Standard';
import OpenDrawerAccountButton from 'components/smart/Button/Drawer/Account';
import DialogBoxesCreatePasteLink from 'components/smart/Dialog/Boxes/Create/PasteLink';


// CONSTANTS
const FIELD_BOX_NAME = 'name';
const FIELD_COUPON_NAME = 'coupon';
const INITIAL_VALUES = { [FIELD_BOX_NAME]: '', [FIELD_COUPON_NAME]: '' };

const DIALOG_CONTENT_PROPS = { alignItems: 'center' };

const DESCRIPTION_ID = 'create-box-dialog-description';

const { conflict } = errorTypes;

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
  const [cannotCreateBoxStep, setCannotCreateBoxStep] = useState(1);


  const currentUser = useSelector(getCurrentUserSelector) || {};
  const level = useMemo(
    () => propOr(0, 'level', currentUser),
    [currentUser],
  );
  const identityId = useMemo(
    () => prop('id', currentUser),
    [currentUser],
  );
  const dispatchUpdateIdentity = useDispatchUpdateIdentity({ identityId });

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
      const normalized = normalize({ members, ...newBox }, BoxesSchema.entity);
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

  const onSubmitCouponSuccess = useCallback(
    async () => {
      dispatchUpdateIdentity({ level: 20 })
        .then(() => {
          setCannotCreateBoxStep(1);
          enqueueSnackbar(t('boxes:create.addCouponDialog.success'), { variant: 'success' });
        });
    },
    [enqueueSnackbar, dispatchUpdateIdentity, t],
  );

  const onSubmitCoupon = useCallback((form, { setSubmitting, setFieldError }) => {
    const coupon = form[FIELD_COUPON_NAME];
    return addCoupon({ id: identityId, coupon })
      .then(onSubmitCouponSuccess)
      .catch((e) => {
        const { value: fieldError } = getDetails(e);
        if (e.code === conflict) {
          setFieldError(FIELD_COUPON_NAME, conflict);
        } else if (fieldError) {
          setFieldError(FIELD_COUPON_NAME, fieldError);
        } else {
          handleHttpErrors(e);
        }
      })
      .finally(() => { setSubmitting(false); });
  }, [identityId, onSubmitCouponSuccess, handleHttpErrors]);

  const localOnClose = useCallback(
    () => {
      onClose();
      setCannotCreateBoxStep(1);
    },
    [onClose],
  );

  const onResetFormik = useCallback(
    (e, { resetForm }) => {
      resetForm({ values: INITIAL_VALUES });
      localOnClose();
    },
    [localOnClose],
  );

  const goToNextStep = useCallback(
    () => setCannotCreateBoxStep(2),
    [],
  );

  if (level <= 10) {
    if (cannotCreateBoxStep === 1) {
      return (
        <Dialog
          fullWidth
          fullScreen={fullScreen}
          open={open}
          onClose={localOnClose}
          aria-labelledby="create-box-dialog-title"
          aria-describedby="create-box-dialog-description"
        >
          <DialogTitleWithClose onClose={localOnClose} fullScreen={fullScreen} gutterBottom>
            <BoxFlexFill />
            <OpenDrawerAccountButton side={SIDES.RIGHT} />
          </DialogTitleWithClose>
          <DialogContent
            className={classes.dialogContentRoot}
            contentProps={DIALOG_CONTENT_PROPS}
            title={<Typography id="create-box-dialog-title" variant="h3" align="center" gutterBottom>{t('boxes:create.notOnTheListDialog.title')}</Typography>}
            subtitle={<Typography id={DESCRIPTION_ID} align="center" variant="h5">{t('boxes:create.notOnTheListDialog.subtitle')}</Typography>}
          >
            <Box display="flex" justifyContent="center" my={3}>
              <Button
                standing={BUTTON_STANDINGS.MAIN}
                text={t('boxes:create.notOnTheListDialog.button')}
                onClick={goToNextStep}
              />
            </Box>
            <Typography align="center" variant="h4" gutterBottom>{t('boxes:create.notOnTheListDialog.getCodeTitle')}</Typography>
            <Typography align="center" paragraph>
              <Trans i18nKey="boxes:create.notOnTheListDialog.getCodeDescription">
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
          {fullScreen ? <FooterFullScreen /> : null}
        </Dialog>
      );
    }
    return (
      <Dialog
        fullWidth
        fullScreen={fullScreen}
        open={open}
        onClose={localOnClose}
        aria-labelledby="create-box-dialog-title"
        aria-describedby={DESCRIPTION_ID}
        {...omitTranslationProps(props)}
      >
        <Formik
          validationSchema={couponValidationSchema}
          initialValues={INITIAL_VALUES}
          onSubmit={onSubmitCoupon}
        >
          <Form>
            <DialogTitleWithClose onClose={localOnClose} fullScreen={fullScreen} gutterBottom>
              <BoxFlexFill />
              <OpenDrawerAccountButton side={SIDES.RIGHT} />
            </DialogTitleWithClose>
            <DialogContent
              className={classes.dialogContentRoot}
              title={<Title>{t('boxes:create.addCouponDialog.title')}</Title>}
            >
              <Typography id={DESCRIPTION_ID}>{t('boxes:create.addCouponDialog.content')}</Typography>
              <Field
                component={FieldTextStandard}
                className={classes.inputField}
                name={FIELD_COUPON_NAME}
                label={t('boxes:create.addCouponDialog.fields.coupon')}
                prefix="boxes."
                autoFocus
                id="Coupon"
                type="text"
                fullWidth
              />
              <BoxControls
                primary={{
                  type: 'submit',
                  text: t('common:validate'),
                }}
                formik
              />
            </DialogContent>
          </Form>
        </Formik>
        {fullScreen ? <FooterFullScreen /> : null}
      </Dialog>
    );
  }

  return (
    <Dialog
      fullWidth
      fullScreen={fullScreen}
      open={open}
      onClose={localOnClose}
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
