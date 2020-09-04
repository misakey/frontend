import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { CLOSED } from 'constants/app/boxes/statuses';
import routes from 'routes';
import BoxesSchema from 'store/schemas/Boxes';

import isEmpty from '@misakey/helpers/isEmpty';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { Link } from 'react-router-dom';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import BoxAvatar from 'components/dumb/Avatar/Box';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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
  const { avatarUrl, title, members, id, lifecycle } = useMemo(() => box, [box]);

  const routeDetails = useGeneratePathKeepingSearchAndHash(routes.boxes.read.details, { id });

  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const isBoxClosed = useMemo(
    () => lifecycle === CLOSED,
    [lifecycle],
  );

  const membersText = useMemo(
    () => {
      if (members.length === 1 && belongsToCurrentUser) {
        return t('boxes:read.details.menu.members.creator');
      }
      if (isBoxClosed) {
        return t('boxes:read.events.information.lifecycle.closed.generic');
      }
      return t('boxes:read.details.menu.members.count', { count: members.length });
    },
    [belongsToCurrentUser, members, isBoxClosed, t],
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
    () => (isEmpty(members)
      ? <Skeleton className={classes.secondarySkeleton} width={SKELETON_WIDTH} />
      : (
        <Typography {...secondaryTypographyProps}>
          {membersText}
        </Typography>
      )),
    [members, membersText, secondaryTypographyProps, classes.secondarySkeleton],
  );

  return (
    <ListItem
      button
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
            {title}
            {!disabled && <ExpandMoreIcon />}
          </Typography>
          )}
        secondary={secondary}
      />
      <BoxAvatar
        aria-label={t('boxes:read.details.open')}
        aria-controls="menu-appbar"
        src={avatarUrl}
        title={title || ''}
      />
    </ListItem>
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
