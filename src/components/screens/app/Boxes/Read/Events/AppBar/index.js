import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import routes from 'routes';

import { CLOSED } from 'constants/app/boxes/statuses';
import BoxesSchema from 'store/schemas/Boxes';

import isEmpty from '@misakey/helpers/isEmpty';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
// import BoxAvatar from '@misakey/ui/Avatar/Box';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Box from '@material-ui/core/Box';
import ShareBoxButton from './ShareBoxButton';
import DeleteBoxDialogButton from './DeleteBoxDialogButton';
import AppBarMenuTabs from './Tabs';

// CONSTANTS
const SKELETON_WIDTH = 100;

const PRIMARY_TYPO_PROPS = {
  variant: 'h5',
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
  },
  listItemContainer: {
    width: '100%',
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
  const { title, members = [], id, lifecycle, hasAccess } = useMemo(() => box, [box]);

  const isTitleEmpty = useMemo(
    () => isEmpty(title),
    [title],
  );

  const routeDetails = useGeneratePathKeepingSearchAndHash(routes.boxes.read.details, { id });

  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const isBoxClosed = useMemo(
    () => lifecycle === CLOSED,
    [lifecycle],
  );

  const isTheOnlyMember = useMemo(
    () => members.length === 1 && belongsToCurrentUser,
    [belongsToCurrentUser, members.length],
  );

  const membersText = useMemo(
    () => {
      if (!hasAccess) {
        return t('boxes:read.events.access.denied');
      }
      if (isBoxClosed) {
        return t('boxes:read.events.information.lifecycle.closed.generic');
      }
      if (isTheOnlyMember) {
        return t('boxes:read.details.menu.members.creator');
      }
      return t('boxes:read.details.menu.members.count', { count: members.length });
    },
    [hasAccess, isBoxClosed, isTheOnlyMember, t, members.length],
  );

  const primaryTypographyProps = useMemo(
    () => (isDownSm
      ? { ...PRIMARY_TYPO_PROPS, variant: 'subtitle1' }
      : PRIMARY_TYPO_PROPS),
    [isDownSm],
  );

  const secondaryTypographyProps = useMemo(
    () => (isDownSm
      ? { ...SECONDARY_TYPO_PROPS, variant: 'subtitle2' }
      : SECONDARY_TYPO_PROPS),
    [isDownSm],
  );

  const secondary = useMemo(
    () => (isEmpty(members) && !isBoxClosed && hasAccess
      ? (
        <Skeleton
          className={classes.secondarySkeleton}
          width={SKELETON_WIDTH}
        />
      )
      : (
        <Typography {...secondaryTypographyProps}>
          {membersText}
        </Typography>
      )),
    [members, isBoxClosed, hasAccess, classes, secondaryTypographyProps, membersText],
  );

  const isClosed = useMemo(
    () => lifecycle === CLOSED,
    [lifecycle],
  );

  const canShare = useMemo(
    () => !isClosed && (hasAccess || belongsToCurrentUser),
    [belongsToCurrentUser, hasAccess, isClosed],
  );

  const canDeleteBox = useMemo(
    () => belongsToCurrentUser && isClosed,
    [belongsToCurrentUser, isClosed],
  );

  const displayTabs = useMemo(
    () => (!isClosed || belongsToCurrentUser) && hasAccess,
    [belongsToCurrentUser, hasAccess, isClosed],
  );

  return (
    <Box display="flex" flexDirection="column" width="100%">
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
            <Typography className={classes.typographyFlex} {...primaryTypographyProps}>
              {isTitleEmpty ? <Skeleton width={200} /> : title}
              {!disabled && <ExpandMoreIcon />}
            </Typography>
          )}
          secondary={secondary}
        />
        <ListItemSecondaryAction>
          {canShare && <ShareBoxButton box={box} />}
          {canDeleteBox && <DeleteBoxDialogButton box={box} />}
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
