import { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generatePath, Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { CLOSED } from 'constants/app/boxes/statuses';
import BoxesSchema from 'store/schemas/Boxes';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import { getBoxEventLastDate } from 'helpers/boxEvent';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';
import useBoxBelongsToCurrentUser from 'hooks/useBoxBelongsToCurrentUser';
import useBoxRights from 'hooks/useBoxRights';

import Skeleton from '@material-ui/lab/Skeleton';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Badge from '@misakey/ui/Badge';
import BoxAvatar from '@misakey/ui/Avatar/Box';
import BoxAvatarSkeleton from '@misakey/ui/Avatar/Box/Skeleton';
import TypographyDateSince from 'components/dumb/Typography/DateSince';
import BoxEventsAccordingToType from 'components/smart/Box/Event';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import MenuItemBoxMute from 'components/smart/MenuItem/Box/Mute';
import MenuItemBoxLeave from 'components/smart/MenuItem/Box/Leave';
import MenuItemBoxDelete from 'components/smart/MenuItem/Box/Delete';
import MenuItemBoxClose from 'components/smart/MenuItem/Box/Close';
import MenuItemBoxCloseDelete from 'components/smart/MenuItem/Box/CloseDelete';
import NotificationsOffIcon from '@material-ui/icons/NotificationsOff';

const DEFAULT_SETTINGS = { muted: false };

// HOOKS
const useStyles = makeStyles(() => ({
  listItemText: {
    // Needed for IE11
    width: '100%',
  },
  iconStack: {
    position: 'absolute',
  },
  background: {
    visibility: '0.5',
  },
  menuButton: ({ isActionVisible }) => ({
    visibility: isActionVisible ? 'visible' : 'hidden',
  }),
  listItemRoot: ({ isActionVisible }) => ({
    paddingRight: isActionVisible ? 48 : 16,
  }),
}));

// COMPONENTS
export const BoxListItemSkeleton = (props) => (
  <ListItem {...props}>
    <ListItemAvatar>
      <BoxAvatarSkeleton />
    </ListItemAvatar>
    <ListItemText
      primary={(
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Skeleton
            component="span"
            variant="text"
            width="50%"
          />
          <Skeleton
            component="span"
            variant="text"
            width="20%"
          />

        </Box>
      )}
      secondary={(
        <Skeleton
          component="span"
          variant="text"
          width="50%"
        />
      )}
    />
  </ListItem>
);

function BoxListItem({ box, toRoute, containerProps, t, ...rest }) {
  const [anchorEl, setAnchorEl] = useState(null);
  // prefer state variable over css because hover is not enough to handle UX
  const [isActionVisible, setIsActionVisible] = useState(false);
  const classes = useStyles({ isActionVisible });


  const {
    id,
    title,
    publicKey,
    lastEvent = {},
    lifecycle,
    eventsCount = 0,
    settings: { muted } = DEFAULT_SETTINGS,
  } = useMemo(() => box || {}, [box]);

  const linkProps = useMemo(
    () => (isNil(toRoute) || isNil(id) ? {} : {
      to: generatePath(toRoute, { id }),
      button: true,
      component: Link,
    }),
    [id, toRoute],
  );

  const secondary = useMemo(
    () => (isNil(box) || isEmpty(lastEvent)
      ? null // @FIXME we could create a Skeleton
      : (
        <BoxEventsAccordingToType box={box} event={lastEvent} preview />
      )),
    [lastEvent, box],
  );

  const publicKeysWeCanDecryptFrom = useBoxPublicKeysWeCanDecryptFrom();
  const canBeDecrypted = useMemo(
    () => publicKeysWeCanDecryptFrom.has(publicKey),
    [publicKeysWeCanDecryptFrom, publicKey],
  );

  const belongsToCurrentUser = useBoxBelongsToCurrentUser(box);
  const { canDelete, canLeave, canClose } = useBoxRights(box, belongsToCurrentUser);

  const isClosed = useMemo(
    () => lifecycle === CLOSED,
    [lifecycle],
  );

  const lostKey = useMemo(
    () => !canBeDecrypted && (!isClosed || belongsToCurrentUser),
    [canBeDecrypted, isClosed, belongsToCurrentUser],
  );

  const showEventsCount = useMemo(
    () => canBeDecrypted,
    [canBeDecrypted],
  );

  const badgeProps = useMemo(
    () => {
      if (muted) {
        return {
          badgeContent: <NotificationsOffIcon style={{ fontSize: 12 }} />,
          color: 'primary',
        };
      }
      return {
        badgeContent: showEventsCount ? eventsCount : 0,
        color: 'secondary',
      };
    },
    [muted, showEventsCount, eventsCount],
  );

  const date = useMemo(
    () => getBoxEventLastDate(lastEvent),
    [lastEvent],
  );

  const onMenuClick = useCallback(
    (event) => { setAnchorEl(event.currentTarget); }, [],
  );

  const onClose = useCallback(
    () => { setAnchorEl(null); }, [],
  );

  const showAction = useCallback(() => setIsActionVisible(true), [setIsActionVisible]);
  const hideAction = useCallback(() => setIsActionVisible(false), [setIsActionVisible]);

  if (isNil(id) || isNil(title)) {
    return null;
  }

  return (
    <ListItem
      key={id}
      ContainerProps={{
        onMouseEnter: showAction,
        onMouseLeave: hideAction,
        ...containerProps,
      }}
      classes={{ root: classes.listItemRoot }}
      {...linkProps}
      {...omitTranslationProps(rest)}
    >
      <ListItemAvatar>
        <Badge {...badgeProps}>
          <BoxAvatar
            title={title}
            lostKey={lostKey}
          />
        </Badge>
      </ListItemAvatar>
      <ListItemText
        className={classes.listItemText}
        primary={(
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography noWrap>{title}</Typography>
            {!isActionVisible && <TypographyDateSince date={date} className="hideOnHover" />}
          </Box>
        )}
        secondary={secondary}
        primaryTypographyProps={{ noWrap: true, display: 'block' }}
        secondaryTypographyProps={{ noWrap: true, display: 'block', component: Box }}
      />
      <ListItemSecondaryAction>
        <IconButton className={classes.menuButton} onClick={onMenuClick} edge="end" aria-label="menu-more">
          <MoreVertIcon />
        </IconButton>
        <Menu
          id={`menu-box-${id}`}
          anchorEl={anchorEl}
          open={!isNil(anchorEl)}
          onClose={onClose}
          onClick={onClose}
          keepMounted
          variant="menu"
          MenuListProps={{ disablePadding: true }}
          PaperProps={{ variant: 'outlined' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItemBoxMute box={box} />
          {lostKey && (canClose || canDelete) ? (
            <MenuItemBoxCloseDelete box={box} onClose={hideAction} />
          ) : ([
            canClose && <MenuItemBoxClose key="close" box={box} onClose={hideAction} />,
            canDelete && <MenuItemBoxDelete key="delete" box={box} onClose={hideAction} />,
          ])}
          {canLeave && <MenuItemBoxLeave box={box} onClose={hideAction} />}
        </Menu>
      </ListItemSecondaryAction>
    </ListItem>
  );
}

BoxListItem.propTypes = {
  containerProps: PropTypes.object,
  box: PropTypes.shape(BoxesSchema.propTypes),
  toRoute: PropTypes.string,
  // withTranslation
  t: PropTypes.func.isRequired,
};

BoxListItem.defaultProps = {
  containerProps: {},
  box: null,
  toRoute: null,
};

export default withTranslation('common')(BoxListItem);
