import React, { useCallback, useState, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import makeStyles from '@material-ui/core/styles/makeStyles';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ReplayIcon from '@material-ui/icons/Replay';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SettingsIcon from '@material-ui/icons/Settings';

import CardSimpleDoubleButton from '@misakey/ui/Card/Simple/DoubleButton';
import CardSimpleText from '@misakey/ui/Card/Simple/Text';
import RegisterTotpDialog from '@misakey/react/auth/components/screens/Identity/Account/Security/MFA/TOTP/Dialog';

import IdentitySchema from '@misakey/react/auth/store/schemas/Identity';

import { deleteTotpConfiguration, resetTotpRecoveryCodes } from '@misakey/core/auth/builder/identities';
import { userIdentityUpdate } from '@misakey/react/auth/store/actions/identity/account';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { UserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';
import eventStopPropagation from '@misakey/core/helpers/event/stopPropagation';

import { TOTP, DISABLED } from '@misakey/react/auth/constants/account/mfaMethod';

const MFA_TOTP_FIELD = 'totp';

const { acr: getCurrentAcrSelector } = authSelectors;

// HOOKS
const useStyles = makeStyles((theme) => ({
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
const ListItemTotp = ({ identity, onChangeMFAMethod }) => {
  const { t } = useTranslation('account');
  const classes = useStyles();
  const handleHttpErrors = useHandleHttpErrors();
  const dispatch = useDispatch();

  const isSmall = useXsMediaQuery();

  const currentAcr = useSelector(getCurrentAcrSelector);
  const { askSigninRedirect } = useContext(UserManagerContext);

  const [isRegisterDialogOpened, setIsRegisterDialogOpened] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [shouldUpdateMethodOnSuccess, setShouldUpdateMethodOnSuccess] = useState(false);

  const { id: identityId, hasTotpSecret, mfaMethod } = useSafeDestr(identity);

  const onClose = useCallback(() => { setIsRegisterDialogOpened(false); }, []);
  const onRegisterTotp = useCallback(() => { setIsRegisterDialogOpened(true); }, []);

  const isTotpActivated = useMemo(
    () => mfaMethod === TOTP,
    [mfaMethod],
  );

  const onActivateTotp = useCallback(
    () => {
      setShouldUpdateMethodOnSuccess(true);
      return onRegisterTotp();
    },
    [onRegisterTotp],
  );

  const onChange = useCallback(
    ({ target: { checked } }) => {
      if (checked && !hasTotpSecret) {
        return onActivateTotp();
      }
      return onChangeMFAMethod(checked ? TOTP : DISABLED);
    },
    [hasTotpSecret, onActivateTotp, onChangeMFAMethod],
  );

  const onSuccess = useCallback(
    () => {
      if (!shouldUpdateMethodOnSuccess) { return; }
      onChangeMFAMethod(TOTP);
      setShouldUpdateMethodOnSuccess(false);
    },
    [onChangeMFAMethod, shouldUpdateMethodOnSuccess],
  );

  const onResetTotpConfiguration = useCallback(
    async () => {
      try {
        await onChangeMFAMethod(DISABLED);
        await deleteTotpConfiguration(identityId);
        dispatch(userIdentityUpdate(identityId, { hasTotpSecret: false }));
      } catch (err) {
        handleHttpErrors(err);
      }
    },
    [dispatch, handleHttpErrors, identityId, onChangeMFAMethod],
  );

  const onResetTotpRecoveryCodes = useCallback(
    async () => {
      if (currentAcr < 3) { askSigninRedirect({ acrValues: 3 }); return; }
      try {
        const { recoveryCodes: newRecoveryCodes } = await resetTotpRecoveryCodes(identityId);
        setRecoveryCodes(newRecoveryCodes);
        setIsRegisterDialogOpened(true);
      } catch (err) {
        handleHttpErrors(err);
      }
    },
    [askSigninRedirect, currentAcr, handleHttpErrors, identityId],
  );

  return (
    <Accordion elevation={0}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="totp-content"
        id="totp-header"
      >
        <ListItem divider className={classes.listItem}>
          <Switch
            name={MFA_TOTP_FIELD}
            edge="end"
            color="primary"
            onChange={onChange}
            size={isSmall ? 'small' : undefined}
            onClick={eventStopPropagation}
            onFocus={eventStopPropagation}
            checked={isTotpActivated}
            inputProps={{ 'aria-label': t('account:security.MFA.totp.activate') }}
          />
          <RegisterTotpDialog
            onSuccess={onSuccess}
            open={isRegisterDialogOpened}
            onClose={onClose}
            identityId={identityId}
            onSetRecoveryCodes={setRecoveryCodes}
            recoveryCodes={recoveryCodes}
          />
          <ListItemText
            primary={t('account:security.MFA.totp.title')}
            secondary={t('account:security.MFA.totp.subtitle')}
            primaryTypographyProps={{ color: 'textPrimary' }}
            className={classes.listItemText}
          />
        </ListItem>
      </AccordionSummary>
      <AccordionDetails>
        <Box p={2} width="100%">
          {hasTotpSecret ? (
            <CardSimpleDoubleButton
              text={t('account:security.MFA.totp.resetConfig.text')}
              primary={(
                <Tooltip title={t('account:security.MFA.totp.resetConfig.button')}>
                  <IconButton
                    onClick={onResetTotpConfiguration}
                    edge="end"
                    aria-label={t('account:security.MFA.totp.resetConfig.button')}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
              secondary={isTotpActivated ? (
                <Tooltip title={t('account:security.MFA.totp.resetRecoveryCodes.button')}>
                  <IconButton
                    onClick={onResetTotpRecoveryCodes}
                    edge="end"
                    aria-label={t('account:security.MFA.totp.resetRecoveryCodes.button')}
                  >
                    <ReplayIcon />
                  </IconButton>
                </Tooltip>
              ) : null}
            />
          ) : (
            <CardSimpleText
              text={t('account:security.MFA.totp.noConfig.text')}
              button={(
                <IconButton
                  onClick={onActivateTotp}
                  edge="end"
                  aria-label={t('account:security.MFA.totp.noConfig.button')}
                >
                  <SettingsIcon />
                </IconButton>
                )}
            />
          )}

        </Box>

      </AccordionDetails>
    </Accordion>
  );
};

ListItemTotp.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  onChangeMFAMethod: PropTypes.func.isRequired,
};

ListItemTotp.defaultProps = {
  identity: null,
};

export default ListItemTotp;
