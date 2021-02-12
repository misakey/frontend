import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import routes from 'routes';

import { SMALL } from '@misakey/ui/Avatar';
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
import Box from '@material-ui/core/Box';
import AvatarGroupMembers from '@misakey/ui/AvatarGroup/Members';
import ToggleDrawerButton from 'components/smart/Screen/Drawer/AppBar/ToggleButton';
import ShareBoxButton from './ShareBoxButton';
import AppBarMenuTabs from './Tabs';

// CONSTANTS
const SKELETON_WIDTH = 100;
const MAX_MEMBERS = 3;

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
    // for the toggle button, as a secondary action
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(5),
    },
  },
  listItemText: {
    margin: 0,
  },
  listItemContainer: {
    width: '100%',
  },
  listItemSecondaryActionRoot: {
    display: 'flex',
    alignItems: 'center',
  },
  toggleButton: {
    position: 'absolute',
    left: 16,
  },
  typographyCaret: {
    maxWidth: 'calc(100% - 24px)',
    display: 'inline-block',
  },
  secondarySkeleton: {
    ...theme.typography.body2,
    [theme.breakpoints.down('sm')]: {
      ...theme.typography.subtitle2,
    },
  },
  secondaryReducedHeight: {
    marginTop: theme.spacing(-1),
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
        <Typography
          className={classes.secondaryReducedHeight}
          {...SECONDARY_TYPO_PROPS}
        >
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
        dense
        {...omitTranslationProps(props)}
        classes={{ root: classes.listItemRoot }}
      >
        <ToggleDrawerButton className={classes.toggleButton} />

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
          secondary={secondary}
        />
        <AvatarGroupMembers
          max={MAX_MEMBERS}
          members={members}
          size={SMALL}
        />
      </ListItem>
      <Box mx={2} mt={0.5} display="flex" flexDirection="row" justifyContent="space-between">
        {displayTabs && <AppBarMenuTabs boxId={id} />}
        {canShare && <Box mb={0.5}><ShareBoxButton box={box} /></Box>}
      </Box>
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
