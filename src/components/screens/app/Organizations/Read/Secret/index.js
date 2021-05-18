import React, { useState, useMemo, useCallback } from 'react';

import {
  TOOLBAR_MIN_HEIGHT,
  SMALL_AVATAR_SIZE,
  SMALL_AVATAR_SM_SIZE,
} from '@misakey/ui/constants/sizes';
import { selectors as orgSelectors } from 'store/reducers/identity/organizations';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import useOrgId from '@misakey/react/auth/hooks/useOrgId';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import ElevationScroll from '@misakey/ui/ElevationScroll';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import AppbarAccount from 'components/smart/AppBar/Account';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import ButtonCopy, { MODE } from '@misakey/ui/Button/Copy';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ButtonDrawerOrganization from 'components/smart/IconButton/Drawer/Organization';
import TextField from '@misakey/ui/TextField';
import BoxControlsDialog from '@misakey/ui/Box/Controls/Dialog';
import Container from '@material-ui/core/Container';
import Typography from '@misakey/ui/Typography';
import SecretsDialog from 'components/screens/app/Organizations/Read/Secret/Dialog';

import VpnKeyIcon from '@material-ui/icons/VpnKey';

// CONSTANTS
const { makeDenormalizeOrganization } = orgSelectors;

const TOOLBAR_PROPS = {
  minHeight: `${TOOLBAR_MIN_HEIGHT}px !important`,
};
const IDENTIFIER_FIELD = 'organization_identifier';
const SLUG_FIELD = 'organization_slug';

// HOOKS
const useStyles = makeStyles((theme) => ({
  listItemIcon: {
    color: theme.palette.background.paper,
    minWidth: SMALL_AVATAR_SIZE + theme.spacing(0.5),
    [theme.breakpoints.down('sm')]: {
      minWidth: SMALL_AVATAR_SM_SIZE + theme.spacing(0.5),
    },
  },
  listItemText: {
    margin: 0,
  },
  content: {
    boxSizing: 'border-box',
    height: `calc(100% - 2 * ${TOOLBAR_MIN_HEIGHT}px)`,
    overflow: 'auto',
    backgroundColor: theme.palette.background.default,
  },
}));

// COMPONENTS
const OrganizationsReadSecret = () => {
  const { t } = useTranslation(['common', 'organizations']);
  const classes = useStyles();

  const [contentRef, setContentRef] = useState();
  const [dialogOpen, setDialogOpen] = useState(false);

  useUpdateDocHead(t('organizations:secret.title'));

  const orgId = useOrgId();

  const denormalizeOrganizationSelector = useMemo(
    () => makeDenormalizeOrganization(),
    [],
  );
  const organization = useSelector((state) => denormalizeOrganizationSelector(state, orgId));
  const { slug } = useSafeDestr(organization);

  const onContentRef = useCallback(
    (ref) => {
      setContentRef(ref);
    },
    [setContentRef],
  );

  const onDialog = useCallback(
    () => setDialogOpen(true),
    [setDialogOpen],
  );

  const onClose = useCallback(
    () => setDialogOpen(false),
    [setDialogOpen],
  );

  return (
    <>
      <ElevationScroll target={contentRef}>
        <Box display="flex" flexDirection="column">
          <AppbarAccount
            toolbarProps={TOOLBAR_PROPS}
          />
          <AppBarStatic
            color="primary"
            toolbarProps={TOOLBAR_PROPS}
          >
            <ButtonDrawerOrganization color="background" />
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemIcon className={classes.listItemIcon}>
                  <VpnKeyIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={(
                    <Typography
                      variant="body2"
                      color="background"
                    >
                      {t('organizations:secret.title')}
                    </Typography>
                  )}
                  disableTypography
                  className={classes.listItemText}
                />
              </ListItem>
            </List>
            <BoxFlexFill />
          </AppBarStatic>
        </Box>
      </ElevationScroll>
      <Box ref={onContentRef} pb={2} className={classes.content}>
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
            name={SLUG_FIELD}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <ButtonCopy
                  value={slug}
                  message={t('organizations:secret.slug')}
                  mode={MODE.icon}
                />
              ),
            }}
            helperText={t('organizations:secret.slug')}
            value={slug}
          />
          <BoxControlsDialog
            mt={2}
            primary={{
              text: t('organizations:secret.generate'),
              onClick: onDialog,
            }}
          />
          <SecretsDialog
            orgId={orgId}
            open={dialogOpen}
            onClose={onClose}
            slug={slug}
          />
        </Container>
      </Box>
    </>
  );
};

export default OrganizationsReadSecret;
