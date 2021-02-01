import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Form, Field } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

import Title from '@misakey/ui/Typography/Title';
import FieldBooleanControlSwitch from 'components/dumb/Form/Field/BooleanControl/Switch';
import Formik from '@misakey/ui/Formik';
import FormikAutoSave from '@misakey/ui/Formik/AutoSave';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import Avatar from '@material-ui/core/Avatar';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import ListSubheader from '@material-ui/core/ListSubheader';
import Skeleton from '@material-ui/lab/Skeleton';

import Typography from '@material-ui/core/Typography';
import TypographyPreWrapped from '@misakey/ui/Typography/PreWrapped';
import AccountMFADeviceActionAdd from 'components/screens/app/Account/Security/MFA/DeviceActions/Add';
import AccountMFADeviceActionDelete from 'components/screens/app/Account/Security/MFA/DeviceActions/Delete';
import makeStyles from '@material-ui/core/styles/makeStyles';
import WebauthnIncompatibilityWarning from '@misakey/react-auth/components/Webauthn/IncompatibilityWarning';

import IdentitySchema from 'store/schemas/Identity';
import { userIdentityUpdate } from 'store/actions/screens/account';
import { receiveWebauthnDevices, makeDenormalizeWebauthnDevicesSelector } from 'store/reducers/identity/webauthnDevices';

import { listWebauthnRegistration } from '@misakey/auth/builder/identities';
import { updateIdentity } from '@misakey/helpers/builder/identities';
import isNil from '@misakey/helpers/isNil';

import { WEBAUTHN, DISABLED } from 'constants/account/mfaMethod';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

import { DATETIME_SHORT } from '@misakey/ui/constants/formats/dates';



// HOOKS
const useStyles = makeStyles((theme) => ({
  subheader: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    textTransform: 'uppercase',
  },
}));

const MFA_WEBAUTHN_FIELD = 'webauthn';

// COMPONENTS
const AccountMFA = ({ identity }) => {
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation(['account', 'common']);
  const handleHttpErrors = useHandleHttpErrors();
  const dispatch = useDispatch();

  const { id: identityId, mfaMethod } = useSafeDestr(identity);

  const webauthnDevicesSelector = useMemo(() => makeDenormalizeWebauthnDevicesSelector(), []);
  const webauthnDevices = useSelector((state) => webauthnDevicesSelector(state, identityId));

  const isWebauthnDevicesNil = useMemo(() => isNil(webauthnDevices), [webauthnDevices]);

  const initialValues = useMemo(
    () => ({ [MFA_WEBAUTHN_FIELD]: mfaMethod === WEBAUTHN }),
    [mfaMethod],
  );

  const onChangeMFAMethod = useCallback(
    async (newMfaMethod) => {
      try {
        await updateIdentity({
          id: identityId,
          mfaMethod: newMfaMethod,
        });
        enqueueSnackbar(t('account:security.MFA.updateMethod.success'), { variant: 'success' });
        dispatch(userIdentityUpdate(identityId, { mfaMethod: newMfaMethod }));
      } catch (error) {
        handleHttpErrors(error);
      }
    },
    [dispatch, enqueueSnackbar, handleHttpErrors, identityId, t],
  );

  const onSubmit = useCallback(
    ({ [MFA_WEBAUTHN_FIELD]: webauthn }) => onChangeMFAMethod(webauthn ? WEBAUTHN : DISABLED),
    [onChangeMFAMethod],
  );

  const listRegisteredMFADevices = useCallback(
    async () => {
      try {
        const response = await listWebauthnRegistration(identityId);
        dispatch(receiveWebauthnDevices(response, identityId));
      } catch (error) {
        handleHttpErrors(error);
      }
    },
    [handleHttpErrors, identityId, dispatch],
  );

  const { isFetching } = useFetchEffect(
    listRegisteredMFADevices,
    { shouldFetch: isWebauthnDevicesNil },
  );

  return (
    <>
      <Box display="flex" alignItems="center" mb={2}>
        <Title gutterBottom={false}>{t('account:security.MFA.title')}</Title>
        <BoxFlexFill />
        <Formik initialValues={initialValues} onSubmit={onSubmit} enableReinitialize>
          <Box component={Form} display="flex" alignItems="center">
            <FormikAutoSave
              mx={2}
              display="flex"
              justifyContent="center"
              debounceMs={1000}
              debounceLoader
              circularProgressProps={{ size: 20 }}
            />
            <Field
              component={FieldBooleanControlSwitch}
              name={MFA_WEBAUTHN_FIELD}
              color="primary"
              disabled={isWebauthnDevicesNil || webauthnDevices.length === 0}
              labels={{
                true: t('common:activated'),
                false: t('common:deactivated'),
              }}
            />
          </Box>
        </Formik>
      </Box>
      <WebauthnIncompatibilityWarning />
      <List subheader={(
        <ListSubheader className={classes.subheader}>
          <Box display="flex" alignItems="center">
            <Typography>{t('account:security.MFA.devicesList.title')}</Typography>
            <BoxFlexFill />
            <AccountMFADeviceActionAdd identityId={identityId} />
          </Box>
        </ListSubheader>
      )}
      >
        {isFetching && (
          <ListItem divider>
            <ListItemAvatar>
              <Skeleton variant="rect" width="5rem" height="5rem" />
            </ListItemAvatar>
            <ListItemText
              primary={<Skeleton variant="text" width="60%" />}
              secondary={<Skeleton variant="text" width="40%" />}
            />
          </ListItem>
        )}
        {!isWebauthnDevicesNil && webauthnDevices.length === 0 && (
          <ListItem divider alignItems="center">
            <ListItemText
              primary={t('account:security.MFA.devicesList.empty')}
              primaryTypographyProps={{ align: 'center', variant: 'h6', component: TypographyPreWrapped }}
            />
          </ListItem>
        )}
        {!isWebauthnDevicesNil && webauthnDevices.map(({ name, createdAt, id }) => (
          <ListItem divider key={id}>
            <ListItemAvatar>
              <Avatar>
                <FingerprintIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={name}
              primaryTypographyProps={{ noWrap: true, display: 'block', color: 'textPrimary' }}
              secondary={moment(createdAt).format(DATETIME_SHORT)}
            />
            <ListItemSecondaryAction>
              <AccountMFADeviceActionDelete
                identityId={identityId}
                deviceId={id}
                shouldShowConfirm={mfaMethod === WEBAUTHN && webauthnDevices.length === 1}
                onChangeMFAMethod={onChangeMFAMethod}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </>
  );
};

AccountMFA.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
};

AccountMFA.defaultProps = {
  identity: null,
};

export default AccountMFA;
