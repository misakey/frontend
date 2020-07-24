import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import BoxesSchema from 'store/schemas/Boxes';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { Link } from 'react-router-dom';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import BoxAvatar from 'components/dumb/Avatar/Box';

// CONSTANTS
const PRIMARY_TYPO_PROPS = {
  variant: 'h5',
  noWrap: true,
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
  listItemTextPrimary: {
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.typography.subtitle1.fontSize,
    },
  },
  listItemTextSecondary: {
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.typography.subtitle2.fontSize,
    },
  },
}));

// COMPONENTS
const EventsAppBar = ({ box, t, belongsToCurrentUser, ...props }) => {
  const classes = useStyles();
  const { avatarUrl, title, members, id } = useMemo(() => box, [box]);

  const routeDetails = useGeneratePathKeepingSearchAndHash(routes.boxes.read.details, { id });

  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const membersText = useMemo(
    () => {
      if (members.length === 1 && belongsToCurrentUser) {
        return t('boxes:read.details.menu.members.creator');
      }
      return t('boxes:read.details.menu.members.count', { count: members.length });
    },
    [belongsToCurrentUser, members.length, t],
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

  return (
    <ListItem
      button
      component={Link}
      to={routeDetails}
      overflow="hidden"
      {...omitTranslationProps(props)}
      classes={{ root: classes.listItemRoot }}
    >
      <ListItemText
        classes={{
          primary: classes.listItemTextPrimary,
          secondary: classes.listItemTextSecondary,
        }}
        primary={title}
        primaryTypographyProps={primaryTypographyProps}
        secondary={membersText}
        secondaryTypographyProps={secondaryTypographyProps}
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
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation(['boxes', 'common'])(EventsAppBar);
