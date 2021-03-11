import React, { useMemo, useState, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useHistory, Link } from 'react-router-dom';

import { TOOLBAR_MIN_HEIGHT } from '@misakey/ui/constants/sizes';
import routes from 'routes';

import getNextSearch from '@misakey/helpers/getNextSearch';
import isSelfOrg from 'helpers/isSelfOrg';
import isNil from '@misakey/helpers/isNil';

import { useTranslation } from 'react-i18next';
import useOrgId from 'hooks/useOrgId';
import useFetchOrganizations from 'hooks/useFetchOrganizations';
import useOnAddOrganization from 'hooks/useOnAddOrganization';

import Popover from '@material-ui/core/Popover';
import ListItemOrganizationSelf from 'components/smart/ListItem/Organization/Self';
import ListItemOrganizationLink from 'components/smart/ListItem/Organization/Link';
import ListItemOrganizationSkeleton from '@misakey/ui/ListItem/Organization/Skeleton';
import List from '@material-ui/core/List';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import DialogOrganizationsCreate from 'components/smart/Dialog/Organizations/Create';
import withDialogPassword from '@misakey/react-auth/components/Dialog/Password/with';

import AddIcon from '@material-ui/icons/Add';

// CONSTANTS
const TOOLBAR_PROPS = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  minHeight: `${TOOLBAR_MIN_HEIGHT}px !important`,
};

const SELF_ORG_TO = routes.boxes._;

// COMPONENTS
const IconButtonCreate = withDialogPassword(IconButtonAppBar);

const PopoverOrganizations = forwardRef(({ onClose, open, ...props }, ref) => {
  const { t } = useTranslation('organizations');
  const { replace } = useHistory();

  const fetchOrgOptions = useMemo(
    () => ({
      isReady: open,
      forceRefresh: true, // @FIXME once org cache is working properly, remove that
    }),
    [open],
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const orgId = useOrgId();
  const onAddOrganization = useOnAddOrganization();
  const selfOrgSelected = useMemo(
    () => isSelfOrg(orgId),
    [orgId],
  );

  const onDialog = useCallback(
    (e) => {
      onClose(e);
      setIsDialogOpen(true);
    },
    [onClose, setIsDialogOpen],
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
      onClose();
      onAddOrganization(org);
      replace({
        pathname: routes.boxes._,
        search: getNextSearch('', new Map([['orgId', id]])),
      });
    },
    [onClose, onAddOrganization, replace],
  );

  const { isFetching, organizations } = useFetchOrganizations(fetchOrgOptions);

  const otherOrganizations = useMemo(
    () => (isNil(organizations) ? [] : organizations.filter(({ id }) => !isSelfOrg(id))),
    [organizations],
  );

  return (
    <>
      <Popover
        ref={ref}
        open={open}
        onClose={onClose}
        {...props}
      >
        <AppBarStatic
          toolbarProps={TOOLBAR_PROPS}
          color="primary"
        >
          <Subtitle gutterBottom={false} color="background">{t('organizations:documentTitle')}</Subtitle>
          <BoxFlexFill />
          <IconButtonCreate
            edge="end"
            color="background"
            onClick={onDialog}
            aria-label={t('organizations:create')}
          >
            <AddIcon />
          </IconButtonCreate>
        </AppBarStatic>
        <List disablePadding>
          <ListItemOrganizationSelf
            component={Link}
            to={SELF_ORG_TO}
            selected={selfOrgSelected}
            onClick={onClose}
          />
          {(isFetching) ? (
            <ListItemOrganizationSkeleton />
          ) : otherOrganizations.map(({ id, name: orgName, currentIdentityRole }) => (
            <ListItemOrganizationLink
              key={id}
              id={id}
              name={orgName}
              secondary={t(`organizations:role.${currentIdentityRole}`)}
              selected={orgId === id}
              onClick={onClose}
            />
          ))}
        </List>
      </Popover>
      <DialogOrganizationsCreate
        open={isDialogOpen}
        onSuccess={onDialogSuccess}
        onClose={onDialogClose}
      />
    </>
  );
});

PopoverOrganizations.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

PopoverOrganizations.defaultProps = {
  open: false,
};

export default PopoverOrganizations;
