import React, { forwardRef, useMemo, useState, useCallback } from 'react';
import { Link, useHistory } from 'react-router-dom';

import routes from 'routes';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import isSelfOrg from 'helpers/isSelfOrg';
import isNil from '@misakey/core/helpers/isNil';
import getNextSearch from '@misakey/core/helpers/getNextSearch';

import useFetchOrganizations from 'hooks/useFetchOrganizations';
import useOrgId from '@misakey/react/auth/hooks/useOrgId';
import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useOnAddOrganization from 'hooks/useOnAddOrganization';
import { useTranslation } from 'react-i18next';

import List from '@material-ui/core/List';
import Box from '@material-ui/core/Box';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemOrganizationSelf from 'components/smart/ListItem/Organization/Self';
import ListItemOrganizationLink from 'components/smart/ListItem/Organization/Link';
import ListItemOrganizationSkeleton from '@misakey/ui/ListItem/Organization/Skeleton';
import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';
import withDialogPassword from '@misakey/react/auth/components/Dialog/Password/with';
import DialogOrganizationsCreate from 'components/smart/Dialog/Organizations/Create';

import AddIcon from '@material-ui/icons/Add';

// CONSTANTS
const { identity: IDENTITY_SELECTOR } = authSelectors;

// COMPONENTS
const IconButtonCreate = withDialogPassword(IconButtonAppBar);
const ListWorkspaces = forwardRef((props, ref) => {
  const { t } = useTranslation('common');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { replace } = useHistory();

  const orgId = useOrgId();
  const onAddOrganization = useOnAddOrganization();
  const selfOrgSelected = useMemo(
    () => isSelfOrg(orgId),
    [orgId],
  );

  const meIdentity = useSelector(IDENTITY_SELECTOR);
  const { displayName } = useSafeDestr(meIdentity);

  const {
    isFetching: isFetchingOrganizations,
    shouldFetch: shouldFetchOrganizations,
    organizations,
  } = useFetchOrganizations();

  const otherOrganizations = useMemo(
    () => (isNil(organizations) ? [] : organizations.filter(({ id }) => !isSelfOrg(id))),
    [organizations],
  );

  const organizationsReady = useMemo(
    () => !isFetchingOrganizations && !shouldFetchOrganizations,
    [isFetchingOrganizations, shouldFetchOrganizations],
  );

  const onDialog = useCallback(
    () => {
      setIsDialogOpen(true);
    },
    [setIsDialogOpen],
  );

  const onDialogClose = useCallback(
    () => {
      setIsDialogOpen(false);
    },
    [setIsDialogOpen],
  );

  const onDialogSuccess = useCallback(
    (org) => {
      const { id } = org;
      setIsDialogOpen(false);
      onAddOrganization(org);
      replace({
        pathname: routes.organizations._,
        search: getNextSearch('', new Map([['orgId', id]])),
      });
    },
    [onAddOrganization, replace],
  );

  return (
    <List
      ref={ref}
      subheader={(
        <ListSubheader>
          <Box display="flex" flexDirection="row" flexGrow={1} justifyContent="space-between">
            {t('common:workspaces')}
            <IconButtonCreate
              edge="end"
              color="primary"
              onClick={onDialog}
              aria-label={t('organizations:create')}
            >
              <AddIcon />
            </IconButtonCreate>
            <DialogOrganizationsCreate
              open={isDialogOpen}
              onSuccess={onDialogSuccess}
              onClose={onDialogClose}
            />
          </Box>
        </ListSubheader>
      )}
      {...props}
    >
      <ListItemOrganizationSelf
        component={Link}
        to={routes.boxes._}
        selected={selfOrgSelected}
        secondary={displayName}
        dense
      />
      {organizationsReady
        ? (otherOrganizations).map(({ id, name: orgName, logoUrl, currentIdentityRole }) => (
          <ListItemOrganizationLink
            key={id}
            id={id}
            name={orgName}
            logoUrl={logoUrl}
            secondary={isNil(currentIdentityRole) ? t('common:member') : t('common:manage')}
            dense
            disabled={isNil(currentIdentityRole)}
          />
        )) : (
          <ListItemOrganizationSkeleton />
        )}
    </List>
  );
});

export default ListWorkspaces;
