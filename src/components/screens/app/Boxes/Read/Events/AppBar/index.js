import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import routes from 'routes';

import { TOOLBAR_MIN_HEIGHT, SMALL } from '@misakey/ui/constants/sizes';

import BoxesSchema from 'store/schemas/Boxes';

import isEmpty from '@misakey/helpers/isEmpty';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';

import Box from '@material-ui/core/Box';
import AvatarGroupMembers from '@misakey/ui/AvatarGroup/Members';
import ToggleDrawerButton from 'components/smart/Screen/Drawer/AppBar/ToggleButton';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ShareBoxButton from './ShareBoxButton';
import AppBarMenuTabs from './Tabs';


// CONSTANTS
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
  listItemRoot: {
    paddingTop: theme.spacing(0),
    paddingBottom: theme.spacing(0),
    minHeight: TOOLBAR_MIN_HEIGHT,
  },
  listItemText: {
    margin: 0,
  },
  listItemSecondaryActionRoot: {
    display: 'flex',
    alignItems: 'center',
  },
  typographyCaret: {
    maxWidth: 'calc(100% - 24px)',
    display: 'inline-block',
  },
  secondaryReducedHeight: {
    marginTop: theme.spacing(-1),
  },
}));

// COMPONENTS
const EventsAppBar = ({ box, t, belongsToCurrentUser, disabled, ...props }) => {
  const classes = useStyles();
  const { title, members = [], id, hasAccess, isMember } = useMemo(() => box, [box]);

  const isTitleEmpty = useMemo(
    () => isEmpty(title),
    [title],
  );

  const routeDetails = useGeneratePathKeepingSearchAndHash(routes.boxes.read.details, { id });

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

  const displayTabs = useMemo(
    () => isMember,
    [isMember],
  );

  return (
    <Box display="flex" flexDirection="column" width="100%" overflow="hidden">
      <AppBarStatic
        toolbarProps={TOOLBAR_PROPS}
      >
        <ToggleDrawerButton />
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
            root: classes.listItemRoot,
          }}
        >
          <ListItemText
            disableTypography
            className={classes.listItemText}
            primary={(
              <>
                <Typography className={classes.typographyCaret} {...PRIMARY_TYPO_PROPS}>
                  {isTitleEmpty ? <Skeleton width={200} /> : title}
                </Typography>
                {!disabled && <ExpandMoreIcon />}
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
          <AvatarGroupMembers
            max={MAX_MEMBERS}
            members={members}
            size={SMALL}
          />
        </ListItem>
      </AppBarStatic>
      <AppBarStatic
        toolbarProps={TOOLBAR_PROPS}
        color="primary"
      >
        {displayTabs && <AppBarMenuTabs boxId={id} />}
        {canShare && <ShareBoxButton box={box} />}
      </AppBarStatic>
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
