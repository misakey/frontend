import React, { useCallback, useMemo, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

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
import Switch from '@material-ui/core/Switch';

import Typography from '@material-ui/core/Typography';
import TypographyPreWrapped from '@misakey/ui/Typography/PreWrapped';
import AccountMFADeviceActionAdd from '@misakey/react-auth/components/screens/Identity/Account/Security/MFA/Webauthn/DeviceActions/Add';
import AccountMFADeviceActionDelete from '@misakey/react-auth/components/screens/Identity/Account/Security/MFA/Webauthn/DeviceActions/Delete';
import makeStyles from '@material-ui/core/styles/makeStyles';
import WebauthnIncompatibilityWarning from '@misakey/react-auth/components/Webauthn/IncompatibilityWarning';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import IdentitySchema from '@misakey/react-auth/store/schemas/Identity';
import { receiveWebauthnDevices, makeDenormalizeWebauthnDevicesSelector } from '@misakey/react-auth/store/reducers/identity/webauthnDevices';

import { listWebauthnRegistration } from '@misakey/auth/builder/identities';
import isNil from '@misakey/helpers/isNil';
import eventStopPropagation from '@misakey/helpers/event/stopPropagation';

import { WEBAUTHN, DISABLED } from '@misakey/react-auth/constants/account/mfaMethod';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';

import { DATETIME_SHORT } from '@misakey/ui/constants/formats/dates';

const MFA_WEBAUTHN_FIELD = 'webauthn';

// HOOKS
const useStyles = makeStyles((theme) => ({
  subheader: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    textTransform: 'uppercase',
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  listItemText: {
    marginLeft: theme.spacing(2),
    marginRight: 0,
  },
}));

// COMPONENTS
const ListItemWebauthn = ({ identity, onChangeMFAMethod }) => {
  const classes = useStyles();
  const detailsRef = useRef();

  const { t } = useTranslation(['account', 'common']);
  const handleHttpErrors = useHandleHttpErrors();
  const dispatch = useDispatch();
  const isSmall = useXsMediaQuery();

  const { id: identityId, mfaMethod } = useSafeDestr(identity);
  const [isDevicesListOpened, setIsDevicesListOpened] = useState(false);

  const webauthnDevicesSelector = useMemo(() => makeDenormalizeWebauthnDevicesSelector(), []);
  const webauthnDevices = useSelector((state) => webauthnDevicesSelector(state, identityId));

  const isWebauthnDevicesNil = useMemo(() => isNil(webauthnDevices), [webauthnDevices]);

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

  const isWebauthnActivated = useMemo(
    () => mfaMethod === WEBAUTHN,
    [mfaMethod],
  );

  const onChange = useCallback(
    ({ target: { checked } }) => {
      if (checked && (isWebauthnDevicesNil || webauthnDevices.length === 0)) {
        return setIsDevicesListOpened(true);
      }
      return onChangeMFAMethod(checked ? WEBAUTHN : DISABLED);
    },
    [isWebauthnDevicesNil, onChangeMFAMethod, webauthnDevices],
  );

  const onToggleDevicesList = useCallback(
    (_, expanded) => {
      setIsDevicesListOpened(expanded);
      setTimeout(() => detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'end' }), 200);
    },
    [],
  );

  return (
    <Accordion elevation={0} expanded={isDevicesListOpened} onChange={onToggleDevicesList}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="webauthn-content"
        id="webauthn-header"
      >
        <ListItem divider className={classes.listItem}>
          <Switch
            name={MFA_WEBAUTHN_FIELD}
            size={isSmall ? 'small' : undefined}
            onClick={eventStopPropagation}
            onFocus={eventStopPropagation}
            color="primary"
            edge="end"
            onChange={onChange}
            checked={isWebauthnActivated}
            inputProps={{ 'aria-label': t('account:security.MFA.webauthn.activate') }}
          />
          <ListItemText
            primary={t('account:security.MFA.webauthn.title')}
            secondary={t('account:security.MFA.webauthn.subtitle')}
            primaryTypographyProps={{ color: 'textPrimary' }}
            className={classes.listItemText}
          />
        </ListItem>
      </AccordionSummary>
      <AccordionDetails>
        <Box p={2} width="100%" ref={detailsRef}>
          <WebauthnIncompatibilityWarning />
          <List subheader={(
            <ListSubheader className={classes.subheader}>
              <Box display="flex" alignItems="center">
                <Typography>{t('account:security.MFA.webauthn.devicesList.title')}</Typography>
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
                primary={t('account:security.MFA.webauthn.devicesList.empty')}
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
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

ListItemWebauthn.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  onChangeMFAMethod: PropTypes.func.isRequired,
};

ListItemWebauthn.defaultProps = {
  identity: null,
};

export default ListItemWebauthn;
