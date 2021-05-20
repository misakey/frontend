import React, { useMemo, useCallback, useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import routes from 'routes';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { selectors as orgSelectors } from 'store/reducers/identity/organizations';
import { boxNameFieldValidationSchema } from 'constants/validationSchemas/boxes';
import setBoxSecrets from '@misakey/react/crypto/store/actions/setBoxSecrets';

import { createBoxBuilder } from '@misakey/core/api/helpers/builder/boxes';
import getRandomTitle from '@misakey/core/helpers/getRandomTitle';
import isFunction from '@misakey/core/helpers/isFunction';
import isNil from '@misakey/core/helpers/isNil';
import prop from '@misakey/core/helpers/prop';
import isSelfOrg from 'helpers/isSelfOrg';
import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';
import logSentryException from '@misakey/core/helpers/log/sentry/exception';
import dialogIsFullScreen from '@misakey/core/helpers/dialog/isFullScreen';
import { createCryptoForNewBox } from '@misakey/core/crypto/box/creation';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';
import useOrgId from '@misakey/react/auth/hooks/useOrgId';
import useFetchOrganizations from 'hooks/useFetchOrganizations';
import useGeneratePathKeepingSearchAndHashCallback from '@misakey/hooks/useGeneratePathKeepingSearchAndHash/callback';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import BoxControlsDialog from '@misakey/ui/Box/Controls/Dialog';
import DialogContent from '@misakey/ui/DialogContent';
import DialogTitleWithCloseFormik from '@misakey/ui/DialogTitle/WithCloseIcon/Formik';
import { Form } from 'formik';
import Field from '@misakey/ui/Form/Field';
import Formik from '@misakey/ui/Formik';
import Dialog from '@material-ui/core/Dialog';
import FieldText from '@misakey/ui/Form/Field/TextFieldWithErrors';
import IconButtonMenuAccount from 'components/smart/IconButton/Menu/Account';
import DialogBoxesCreatePasteLink from 'components/smart/Dialog/Boxes/Create/PasteLink';
import AutocompleteOrganizationField from 'components/smart/Autocomplete/Organization/Field';

// CONSTANTS
const { hasCrypto: hasCryptoSelector } = authSelectors;
const { makeDenormalizeOrganization } = orgSelectors;
const FIELD_BOX_NAME = 'name';
const FIELD_ORG = 'ownerOrgId';
const INITIAL_VALUES = {
  [FIELD_BOX_NAME]: '',
  [FIELD_ORG]: '',
};

const DESCRIPTION_ID = 'create-box-dialog-description';

const SELF_ORG = { id: window.env.SELF_CLIENT.id };

// HELPERS
const idProp = prop('id');

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    padding: theme.spacing(0, 0, 1, 0),
    [dialogIsFullScreen(theme)]: {
      paddingBottom: theme.spacing(0),
    },
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

  const denormalizeOrgSelector = useMemo(
    () => makeDenormalizeOrganization(),
    [],
  );
  const ownerOrgId = useOrgId();
  const organization = useSelector((state) => denormalizeOrgSelector(state, ownerOrgId));
  const isOrgSelfOrg = useMemo(
    () => isSelfOrg(ownerOrgId),
    [ownerOrgId],
  );

  const initialValues = useMemo(
    () => ({
      ...INITIAL_VALUES,
      [FIELD_ORG]: isOrgSelfOrg ? SELF_ORG : organization,
    }),
    [organization, isOrgSelfOrg],
  );

  const {
    isFetching: isFetchingOrganizations,
    shouldFetch: shouldFetchOrganizations,
    organizations,
  } = useFetchOrganizations();
  const options = useMemo(
    () => ([
      ...(organizations || [])
        .filter(({ id, currentIdentityRole }) => !isSelfOrg(id) && !isNil(currentIdentityRole)),
      SELF_ORG,
    ]),
    [organizations],
  );

  const selectOrgFetching = useMemo(
    () => shouldFetchOrganizations || isFetchingOrganizations || isNil(ownerOrgId),
    [isFetchingOrganizations, ownerOrgId, shouldFetchOrganizations],
  );

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
    ({ [FIELD_BOX_NAME]: name, [FIELD_ORG]: org }, { setSubmitting }) => {
      const title = name || placeholder;
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
        ownerOrgId: idProp(org),
      })
        .then((response) => onSubmitNewBoxSuccess(response, boxSecretKey, invitationKeyShare))
        .catch(handleHttpErrors)
        .finally(() => { setSubmitting(false); });
    },
    [handleHttpErrors, onSubmitNewBoxSuccess, placeholder],
  );

  const onResetFormik = useCallback(
    (e, { resetForm }) => {
      resetForm({ values: initialValues });
      onClose();
    },
    [initialValues, onClose],
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
            initialValues={initialValues}
            onSubmit={onSubmitNewBox}
          >
            <Form>
              <DialogTitleWithCloseFormik
                id={DESCRIPTION_ID}
                title={t('boxes:create.dialog.title')}
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
                <AutocompleteOrganizationField
                  name={FIELD_ORG}
                  options={options}
                  isLoading={selectOrgFetching}
                  id="select-org"
                  prefix="boxes."
                  variant="filled"
                  fullWidth
                />
                <Field
                  component={FieldText}
                  className={classes.inputField}
                  name={FIELD_BOX_NAME}
                  prefix="boxes."
                  autoFocus
                  id="BoxName"
                  type="text"
                  placeholder={placeholder}
                  variant="filled"
                  fullWidth
                />
                <BoxControlsDialog
                  mt={1}
                  primary={{
                    type: 'submit',
                    text: t('common:create'),
                  }}
                  secondary={{
                    standing: BUTTON_STANDINGS.TEXT,
                    text: t('boxes:create.dialog.pasteLink'),
                    onClick: onToggleInvitation,
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

export default withTranslation(['common', 'boxes', 'organizations'])(CreateBoxDialog);
