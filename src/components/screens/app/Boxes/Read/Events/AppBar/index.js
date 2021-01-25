import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import routes from 'routes';

import BoxesSchema from 'store/schemas/Boxes';

import isEmpty from '@misakey/helpers/isEmpty';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Box from '@material-ui/core/Box';
import AvatarGroupMembers from '@misakey/ui/AvatarGroup/Members';
import ShareBoxButton from './ShareBoxButton';
import AppBarMenuTabs from './Tabs';

// CONSTANTS
const SKELETON_WIDTH = 100;

const PRIMARY_TYPO_PROPS = {
  variant: 'h6',
  noWrap: true,
  color: 'textPrimary',
};

const SECONDARY_TYPO_PROPS = {
  variant: 'subtitle2',
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
  },
  listItemContainer: {
    width: '100%',
  },
  listItemSecondaryActionRoot: {
    display: 'flex',
    alignItems: 'center',
  },
  avatarGroupMembersRoot: {
    [theme.breakpoints.only('xs')]: {
      display: 'none',
    },
    marginRight: theme.spacing(2),
  },
  typographyFlex: {
    display: 'flex',
    alignItems: 'center',
  },
  secondarySkeleton: {
    ...theme.typography.body2,
    [theme.breakpoints.down('sm')]: {
      ...theme.typography.subtitle2,
    },
  },
}));

// COMPONENTS
const EventsAppBar = ({ box, t, belongsToCurrentUser, disabled, ...props }) => {
  const classes = useStyles();
  const { title, members = [], id, hasAccess } = useMemo(() => box, [box]);

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
        return t('boxes:read.details.menu.members.creator');
      }
      return t('boxes:read.details.menu.members.count', { count: members.length });
    },
    [hasAccess, isTheOnlyMember, t, members.length],
  );

  const secondary = useMemo(
    () => (isEmpty(members) && hasAccess
      ? (
        <Skeleton
          className={classes.secondarySkeleton}
          width={SKELETON_WIDTH}
        />
      )
      : (
        <Typography {...SECONDARY_TYPO_PROPS}>
          {membersText}
        </Typography>
      )),
    [members, hasAccess, classes, membersText],
  );

  const canShare = useMemo(
    () => hasAccess || belongsToCurrentUser,
    [belongsToCurrentUser, hasAccess],
  );

  const displayTabs = useMemo(
    () => hasAccess,
    [hasAccess],
  );

  return (
    <Box display="flex" flexDirection="column" width="100%" overflow="hidden">
      <ListItem
        button
        ContainerProps={{ className: classes.listItemContainer }}
        ContainerComponent="div"
        component={Link}
        to={routeDetails}
        overflow="hidden"
        disabled={disabled}
        {...omitTranslationProps(props)}
        classes={{ root: classes.listItemRoot }}
      >
        <ListItemText
          disableTypography
          primary={(
            <Typography className={classes.typographyFlex} {...PRIMARY_TYPO_PROPS}>
              {isTitleEmpty ? <Skeleton width={200} /> : title}
              {!disabled && <ExpandMoreIcon />}
            </Typography>
          )}
          secondary={secondary}
        />
        <ListItemSecondaryAction classes={{ root: classes.listItemSecondaryActionRoot }}>
          <AvatarGroupMembers
            members={members}
            classes={{ root: classes.avatarGroupMembersRoot }}
          />
          {canShare && <ShareBoxButton box={box} />}
        </ListItemSecondaryAction>
      </ListItem>

      {displayTabs && <AppBarMenuTabs boxId={id} />}
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
