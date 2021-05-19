import React, { useMemo, useState, useCallback } from 'react';

import { selectors as orgSelectors } from 'store/reducers/identity/organizations';
import {
  TOOLBAR_MIN_HEIGHT,
  SMALL_AVATAR_SIZE,
  SMALL_AVATAR_SM_SIZE,
} from '@misakey/ui/constants/sizes';

import useFetchOrganizations from 'hooks/useFetchOrganizations';
import useOrgId from '@misakey/react/auth/hooks/useOrgId';
import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import { useTranslation } from 'react-i18next';

import { BACKGROUND_COLOR } from '@misakey/ui/Avatar/Colorized';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';
import AvatarDetailedSkeleton from '@misakey/ui/Avatar/Detailed/Skeleton';
import ElevationScroll from '@misakey/ui/ElevationScroll';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import AppbarAccount from 'components/smart/AppBar/Account';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ButtonDrawerOrganization from 'components/smart/IconButton/Drawer/Organization';
import Container from '@material-ui/core/Container';
import Typography from '@misakey/ui/Typography';
import OrganizationListShortcuts from 'components/smart/List/Organization/Shortcuts';

import HomeIcon from '@material-ui/icons/Home';

// CONSTANTS
const { makeDenormalizeOrganization } = orgSelectors;
const TOOLBAR_PROPS = {
  minHeight: `${TOOLBAR_MIN_HEIGHT}px !important`,
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatarDetailedRoot: {
    margin: theme.spacing(0, 1, 1),
  },
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
const OrganizationReadHome = () => {
  const classes = useStyles();
  const { t } = useTranslation('organizations');
  const orgId = useOrgId();

  const [contentRef, setContentRef] = useState();

  const { isFetching, shouldFetch } = useFetchOrganizations();

  const organizationReady = useMemo(
    () => !isFetching && !shouldFetch,
    [isFetching, shouldFetch],
  );

  const denormalizeOrganizationSelector = useMemo(
    () => makeDenormalizeOrganization(),
    [],
  );
  const organization = useSelector((state) => denormalizeOrganizationSelector(state, orgId));
  const { name, logoUrl } = useSafeDestr(organization);


  const onContentRef = useCallback(
    (ref) => {
      setContentRef(ref);
    },
    [setContentRef],
  );
  useUpdateDocHead(t('organizations:home.title'));

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
                  <HomeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={(
                    <Typography
                      variant="body2"
                      color="background"
                    >
                      {t('organizations:home.title')}
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
          {organizationReady ? (
            <AvatarDetailed
              text={name}
              image={logoUrl}
              title={name}
              classes={{
                root: classes.avatarDetailedRoot,
              }}
              colorizedProp={BACKGROUND_COLOR}
            />
          ) : (
            <AvatarDetailedSkeleton title />
          )}
          <OrganizationListShortcuts
            display="flex"
            flexDirection="row"
            justifyContent="space-evenly"
          />
        </Container>
      </Box>
    </>
  );
};

export default OrganizationReadHome;
