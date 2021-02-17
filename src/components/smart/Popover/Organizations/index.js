import React, { useMemo, useState, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useHistory, Link } from 'react-router-dom';

import { TOOLBAR_MIN_HEIGHT } from '@misakey/ui/constants/sizes';
import routes from 'routes';

import getNextSearch from '@misakey/helpers/getNextSearch';
import isSelfOrg from 'helpers/isSelfOrg';

import { useTranslation } from 'react-i18next';
import useOrgId from 'hooks/useOrgId';

import Popover from '@material-ui/core/Popover';
import ListItemOrganizationSelf from 'components/smart/ListItem/Organization/Self';
import List from '@material-ui/core/List';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import DialogOrganizationsCreate from 'components/smart/Dialog/Organizations/Create';
import withDialogPassword from 'components/smart/Dialog/Password/with';

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

const PopoverOrganizations = forwardRef(({ onClose, ...props }, ref) => {
  const { t } = useTranslation('organizations');
  const { replace } = useHistory();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const orgId = useOrgId();
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
    ({ id }) => {
      setIsDialogOpen(false);
      onClose();
      replace({
        pathname: routes.boxes._,
        search: getNextSearch('', new Map([['orgId', id]])),
      });
    },
    [setIsDialogOpen, onClose, replace],
  );

  return (
    <>
      <Popover
        ref={ref}
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
          />
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
  onClose: PropTypes.func.isRequired,
};

export default PopoverOrganizations;
