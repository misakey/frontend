import React, { useState, useMemo, useCallback } from 'react';

import { generateOrganizationSecretBuilder } from '@misakey/helpers/builder/organizations';
import isNil from '@misakey/helpers/isNil';

import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import useFetchCallback from '@misakey/hooks/useFetch/callback';
import useOrgId from '@misakey/react-auth/hooks/useOrgId';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import ButtonCopy, { MODE } from '@misakey/ui/Button/Copy';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ButtonDrawerOrganization from 'components/smart/IconButton/Drawer/Organization';
import TextField from '@misakey/ui/TextField';
import BoxControls from '@misakey/ui/Box/Controls';
import Container from '@material-ui/core/Container';
import DialogConfirm from '@misakey/ui/Dialog/Confirm';
import Typography from '@material-ui/core/Typography';
import ListBordered from '@misakey/ui/List/Bordered';
import ListItemOrganizationCurrent from 'components/smart/ListItem/Organization/Current';

import VpnKeyIcon from '@material-ui/icons/VpnKey';

// CONSTANTS
const IDENTIFIER_FIELD = 'organization_identifier';
const FIELD_NAME = 'organization_secret';

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatar: {
    marginRight: theme.spacing(1),
  },
  listItemText: {
    margin: 0,
  },
}));

// COMPONENTS
const OrganizationsReadSecret = () => {
  const { t } = useTranslation(['common', 'organizations']);
  const classes = useStyles();
  const handleHttpErrors = useHandleHttpErrors();

  const [dialogOpen, setDialogOpen] = useState(false);

  useUpdateDocHead(t('organizations:secret.title'));

  const orgId = useOrgId();

  const generateOrganizationSecret = useCallback(
    () => generateOrganizationSecretBuilder(orgId),
    [orgId],
  );

  const onDialog = useCallback(
    () => setDialogOpen(true),
    [setDialogOpen],
  );

  const onClose = useCallback(
    () => setDialogOpen(false),
    [setDialogOpen],
  );

  const { data, wrappedFetch } = useFetchCallback(
    generateOrganizationSecret,
    { onError: handleHttpErrors },
  );

  const { secret } = useSafeDestr(data);

  const secretOrEmpty = useMemo(
    () => (isNil(secret) ? '' : secret),
    [secret],
  );

  return (
    <>
      <AppBarStatic>
        <ButtonDrawerOrganization color="default" />
        <BoxFlexFill />
        <List disablePadding>
          <ListItem>
            <ListItemAvatar>
              <Avatar className={classes.avatar}><VpnKeyIcon fontSize="small" /></Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={t('organizations:secret.title')}
              primaryTypographyProps={{ variant: 'h6', color: 'textPrimary' }}
              className={classes.listItemText}
            />
          </ListItem>
        </List>
        <BoxFlexFill />
        <ListBordered
          dense
          disablePadding
        >
          <ListItemOrganizationCurrent />
        </ListBordered>
      </AppBarStatic>
      <Container maxWidth="sm">
        <TextField
          name={IDENTIFIER_FIELD}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <ButtonCopy
                value={orgId}
                message={t('organizations:secret.identifier')}
                mode={MODE.icon}
              />
            ),
          }}
          helperText={t('organizations:secret.identifier')}
          value={orgId}
        />
        <TextField
          name={FIELD_NAME}
          InputProps={{ readOnly: true }}
          helperText={t('organizations:secret.copy')}
          value={secretOrEmpty}
        />
        <ButtonCopy
          value={secret}
          message={t('organizations:secret.copy')}
          mode={MODE.both}
        />
        <BoxControls
          mt={2}
          primary={{
            text: t('organizations:secret.generate'),
            onClick: onDialog,
          }}
        />
        <DialogConfirm
          onConfirm={wrappedFetch}
          isDialogOpen={dialogOpen}
          onClose={onClose}
          confirmButtonText={t('organizations:secret.generate')}
          title={t('organizations:secret.confirm.title')}
          irreversible
        >
          <Typography color="textSecondary">
            {t('organizations:secret.confirm.body')}
          </Typography>
        </DialogConfirm>
      </Container>
    </>
  );
};

export default OrganizationsReadSecret;
