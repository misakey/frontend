import React, { useMemo, useState, useRef, useCallback } from 'react';

import PropTypes from 'prop-types';
import routes from 'routes';
import { Link, useHistory } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import {
  LARGE, LARGE_AVATAR_SIZE, LARGE_AVATAR_SM_SIZE,
  TOOLBAR_MIN_HEIGHT,
} from '@misakey/ui/constants/sizes';
import BoxesSchema from 'store/schemas/Boxes';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import isEmpty from '@misakey/core/helpers/isEmpty';

import { makeStyles } from '@material-ui/core/styles';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import useBoxRights from 'hooks/useBoxRights';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useSelector } from 'react-redux';

import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';
import Box from '@material-ui/core/Box';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import BoxAvatar from 'components/smart/Avatar/Box';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemShare from 'components/smart/ListItem/Boxes/Share';
import ListItemLeave from 'components/smart/ListItem/Boxes/Leave';
import ListItemDelete from 'components/smart/ListItem/Boxes/Delete';
import ListItemMemberPublicLink from 'components/smart/ListItem/Member/PublicLink';
import ListItemBoxMute from 'components/smart/ListItem/Boxes/Mute';
import ElevationScroll from '@misakey/ui/ElevationScroll';
import AppBarScroll from '@misakey/ui/AppBar/Scroll';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import ContextBoxDialogs from 'components/smart/Context/Boxes/Dialogs';
import DetailsListShortcuts from 'components/screens/app/Boxes/Read/Details/List/Shortcuts';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';

// CONSTANTS
const { identityId: IDENTITY_ID_SELECTOR } = authSelectors;
const CONTENT_SPACING = 2;
const SCROLL_THRESHOLD = LARGE_AVATAR_SIZE + 16;
const SM_SCROLL_THRESHOLD = LARGE_AVATAR_SM_SIZE + 16;

const PRIMARY_TYPO_PROPS = {
  variant: 'body1',
  noWrap: true,
  color: 'textPrimary',
};
const SECONDARY_TYPO_PROPS = {
  variant: 'body2',
  color: 'textSecondary',
};
const TOOLBAR_PROPS = {
  minHeight: `${TOOLBAR_MIN_HEIGHT}px !important`,
};

const OBSERVER_OPTIONS = {
  threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatar: {
    fontSize: theme.typography.h4.fontSize,
    margin: theme.spacing(2, 0),
  },
  content: {
    boxSizing: 'border-box',
    maxHeight: `calc(100% - ${TOOLBAR_MIN_HEIGHT}px)`,
    overflow: 'auto',
  },
  subheader: {
    backgroundColor: theme.palette.background.default,
  },
  primaryText: {
    color: theme.palette.text.primary,
  },
  listItemRoot: {
    width: '100%',
    paddingTop: theme.spacing(0),
    paddingBottom: theme.spacing(0),
    minHeight: TOOLBAR_MIN_HEIGHT,
  },
  listitemTextRoot: {
    margin: theme.spacing(0),
  },
}));

// COMPONENTS
function BoxDetails({ box, belongsToCurrentUser, t }) {
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down('sm'));
  const { replace } = useHistory();
  const classes = useStyles();
  // useRef seems buggy with ElevationScroll
  const [contentRef, setContentRef] = useState();
  const targetRef = useRef();

  const onContentRef = useCallback(
    (ref) => {
      setContentRef(ref);
    },
    [setContentRef],
  );

  const identityId = useSelector(IDENTITY_ID_SELECTOR);

  const {
    id,
    title,
    members = [],
    ownerOrgId,
    lostKey,
  } = useMemo(() => box, [box]);
  const isEmptyMembers = useMemo(
    () => isEmpty(members),
    [members],
  );

  const goBack = useGeneratePathKeepingSearchAndHash(routes.boxes.read._, { id });
  // const routeFiles = useGeneratePathKeepingSearchAndHash(routes.boxes.read.files, { id });

  // @FIXME factorize rules
  const { canDelete, canLeave } = useBoxRights(box, belongsToCurrentUser);

  const onLeaveOrDeleteSuccess = useCallback(
    () => {
      replace(routes.boxes._);
      return Promise.resolve();
    },
    [replace],
  );

  const scrollThreshold = useMemo(
    () => (isDownSm ? SM_SCROLL_THRESHOLD : SCROLL_THRESHOLD),
    [isDownSm],
  );

  if (isEmptyMembers) {
    return <SplashScreenWithTranslation />;
  }

  return (
    <ContextBoxDialogs
      box={box}
      canLeave={canLeave}
      canDelete={canDelete}
      onSuccess={onLeaveOrDeleteSuccess}
    >
      <ElevationScroll target={contentRef}>
        <AppBarScroll
          toolbarProps={TOOLBAR_PROPS}
          component={AppBarStatic}
          scrollTarget={contentRef}
          scrollThreshold={scrollThreshold}
          targetRef={targetRef}
          observerOptions={OBSERVER_OPTIONS}
          transitionChildren={(
            <ListItem disableGutters classes={{ root: classes.listItemRoot }}>
              <ListItemAvatar>
                <BoxAvatar
                  title={title}
                  members={members}
                  ownerOrgId={ownerOrgId}
                  lostKey={lostKey}
                  identityId={identityId}
                  isFetching={isEmptyMembers}
                />
              </ListItemAvatar>
              <ListItemText
                primary={title}
                secondary={t('boxes:read.details.menu.members.count', { count: members.length })}
                primaryTypographyProps={PRIMARY_TYPO_PROPS}
                secondaryTypographyProps={SECONDARY_TYPO_PROPS}
                classes={{ root: classes.listitemTextRoot }}
              />
            </ListItem>
        )}
        >
          <IconButtonAppBar
            aria-label={t('common:goBack')}
            edge="start"
            component={Link}
            to={goBack}
          >
            <ArrowBack />
          </IconButtonAppBar>
        </AppBarScroll>
      </ElevationScroll>
      <Box p={CONTENT_SPACING} pt={0} ref={onContentRef} className={classes.content}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <BoxAvatar
            ref={targetRef}
            classes={{ root: classes.avatar }}
            title={title}
            members={members}
            ownerOrgId={ownerOrgId}
            lostKey={lostKey}
            identityId={identityId}
            size={LARGE}
          />
          <Title gutterBottom={false} align="center">
            {title}
          </Title>
          <Subtitle gutterBottom={false}>
            {t('boxes:read.details.menu.members.count', { count: members.length })}
          </Subtitle>
        </Box>
        <DetailsListShortcuts
          display="flex"
          flexDirection="row"
          justifyContent="space-evenly"
          box={box}
          canLeave={canLeave}
          canDelete={canDelete}
        />
        <List disablePadding>
          <ListItem
            // button
            divider
            aria-label={t('boxes:read.details.menu.title')}
          >
            <ListItemText
              primary={t('boxes:read.details.menu.title')}
              secondary={title}
              primaryTypographyProps={{ variant: 'overline', color: 'textSecondary' }}
              secondaryTypographyProps={{ color: 'textPrimary' }}
            />
            {/* <ChevronRightIcon /> */}
          </ListItem>
          {/* <ListItem
            button
            to={routeFiles}
            component={Link}
            divider
            aria-label={t('boxes:read.details.menu.files')}
          >
            <ListItemText
              primary={t('boxes:read.details.menu.files')}
              primaryTypographyProps={{ noWrap: true, variant: 'overline', color: 'textSecondary' }}
              secondaryTypographyProps={{ noWrap: true, color: 'textPrimary' }}
            />
            <ChevronRightIcon />
          </ListItem> */}
          <ListItemShare box={box} />
          <ListItemBoxMute box={box} />
          <ListItem
            // button
            // to={}
            // component={Link}
            divider
            aria-label={t('boxes:read.details.menu.encryption.primary')}
          >
            <ListItemText
              primary={t('boxes:read.details.menu.encryption.primary')}
              secondary={t('boxes:read.details.menu.encryption.secondary')}
              primaryTypographyProps={{ noWrap: true, variant: 'overline', color: 'textSecondary' }}
              secondaryTypographyProps={{ color: 'textPrimary' }}
            />
          </ListItem>
          {canLeave && <ListItemLeave box={box} />}
          {canDelete && <ListItemDelete box={box} />}
          <List
            disablePadding
            subheader={(
              <ListSubheader className={classes.subheader}>
                <Typography noWrap variant="overline" color="textSecondary">
                  {t('boxes:read.details.menu.members.title')}
                </Typography>
              </ListSubheader>
          )}
          >
            {members.map((member) => (
              <ListItemMemberPublicLink
                key={member.id}
                member={member}
                box={box}
                belongsToCurrentUser={belongsToCurrentUser}
              />
            ))}
          </List>
        </List>
      </Box>
    </ContextBoxDialogs>
  );
}

BoxDetails.propTypes = {
  t: PropTypes.func.isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  belongsToCurrentUser: PropTypes.bool,
};

BoxDetails.defaultProps = {
  belongsToCurrentUser: false,
};

export default withTranslation(['common', 'boxes'])(BoxDetails);
