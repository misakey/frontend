import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import routes from 'routes';

import { TOOLBAR_MIN_HEIGHT, SMALL } from '@misakey/ui/constants/sizes';
import { LIMITED } from '@misakey/ui/constants/accessModes';
import BoxesSchema from 'store/schemas/Boxes';

import isEmpty from '@misakey/core/helpers/isEmpty';
import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import Box from '@material-ui/core/Box';
import AvatarGroupMembers from '@misakey/ui/AvatarGroup/Members';
import ToggleDrawerButton from 'components/smart/Screen/Drawer/AppBar/ToggleButton';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import BoxesAppBarTabs from 'components/screens/app/Boxes/Read/Events/AppBar/Tabs';
import IconSharing from '@misakey/ui/Icon/Sharing';

// CONSTANTS
export const HEADER_MIN_HEIGHT = 2 * TOOLBAR_MIN_HEIGHT;

const SKELETON_WIDTH = 100;
const MAX_MEMBERS = 3;

const TOOLBAR_PROPS = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  minHeight: `${TOOLBAR_MIN_HEIGHT}px !important`,
};

const PRIMARY_TYPO_PROPS = {
  variant: 'body1',
  noWrap: true,
  color: 'textPrimary',
};

const SECONDARY_TYPO_PROPS = {
  variant: 'body2',
  color: 'textSecondary',
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  menuButton: {
    margin: theme.spacing(0, 1),
  },
  listRoot: {
    display: 'flex',
    flexGrow: 1,
    overflow: 'hidden',
  },
  listItemContainer: {
    width: '100%',
  },
  listItemRoot: {
    width: '100%',
    paddingTop: theme.spacing(0),
    paddingBottom: theme.spacing(0),
    minHeight: TOOLBAR_MIN_HEIGHT,
  },
  listItemText: {
    margin: 0,
  },
  secondaryReducedHeight: {
    marginTop: theme.spacing(-1),
  },
}));

// COMPONENTS
const EventsAppBar = ({ box, t, belongsToCurrentUser, disabled, ...props }) => {
  const classes = useStyles();
  const {
    title,
    members = [],
    accessMode,
    id, hasAccess, isMember,
  } = useMemo(() => box, [box]);

  const isTitleEmpty = useMemo(
    () => isEmpty(title),
    [title],
  );

  const iconSharingValue = useMemo(
    () => accessMode || LIMITED,
    [accessMode],
  );

  const routeDetails = useGeneratePathKeepingSearchAndHash(routes.boxes.read.details, { id });
  const routeSharing = useGeneratePathKeepingSearchAndHash(routes.boxes.read.sharing, { id });

  const isTheOnlyMember = useMemo(
    () => members.length === 1 && belongsToCurrentUser,
    [belongsToCurrentUser, members.length],
  );

  const membersText = useMemo(
    () => {
      if (!hasAccess) {
        return t('boxes:read.events.access.denied');
      }
      if (isTheOnlyMember) {
        return t('boxes:read.details.menu.members.creator.only');
      }
      return t('boxes:read.details.menu.members.count', { count: members.length });
    },
    [hasAccess, isTheOnlyMember, t, members.length],
  );

  const canShare = useMemo(
    () => isMember || belongsToCurrentUser,
    [belongsToCurrentUser, isMember],
  );

  return (
    <Box display="flex" flexDirection="column" width="100%" overflow="hidden">
      <AppBarStatic
        toolbarProps={TOOLBAR_PROPS}
      >
        <ToggleDrawerButton />
        <List disablePadding classes={{ root: classes.listRoot }}>
          <ListItem
            button
            component={Link}
            to={routeDetails}
            overflow="hidden"
            disabled={disabled}
            dense
            disableGutters
            {...omitTranslationProps(props)}
            classes={{
              container: classes.listItemContainer,
              root: classes.listItemRoot,
            }}
          >
            <ListItemText
              disableTypography
              className={classes.listItemText}
              primary={(
                <>
                  <Typography {...PRIMARY_TYPO_PROPS}>
                    {isTitleEmpty ? <Skeleton width={200} /> : title}
                  </Typography>
                </>
            )}
              secondary={(
                <Typography
                  className={classes.secondaryReducedHeight}
                  {...SECONDARY_TYPO_PROPS}
                >
                  {isEmpty(members) && hasAccess ? (
                    <Skeleton
                      width={SKELETON_WIDTH}
                    />
                  ) : membersText}
                </Typography>
            )}
            />
          </ListItem>
        </List>
        <Button
          disabled={!canShare}
          component={Link}
          to={routeSharing}
          standing={BUTTON_STANDINGS.TEXT}
          startIcon={belongsToCurrentUser ? (
            <IconSharing
              value={iconSharingValue}
            />
          ) : null}
          text={!isTheOnlyMember ? (
            <AvatarGroupMembers
              max={MAX_MEMBERS}
              members={members}
              size={SMALL}
            />
          ) : t('common:share')}
        />
      </AppBarStatic>
      <BoxesAppBarTabs
        color="primary"
        disabled={!isMember}
        boxId={id}
      />
    </Box>
  );
};

EventsAppBar.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  belongsToCurrentUser: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

EventsAppBar.defaultProps = {
  disabled: false,
};

export default withTranslation(['boxes', 'common'])(EventsAppBar);
