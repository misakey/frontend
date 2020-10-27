import React, { useMemo } from 'react';
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

function BoxListItem({ box, toRoute, t, ...rest }) {
  const classes = useStyles();

  const {
    id,
    title,
    publicKey,
    lastEvent = {},
    lifecycle,
    eventsCount = 0,
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

  const lostKey = useMemo(
    () => !canBeDecrypted && (lifecycle !== CLOSED || belongsToCurrentUser),
    [canBeDecrypted, lifecycle, belongsToCurrentUser],
  );

  const showEventsCount = useMemo(
    () => canBeDecrypted,
    [canBeDecrypted],
  );

  const badgeContent = useMemo(
    () => (showEventsCount ? eventsCount : 0),
    [showEventsCount, eventsCount],
  );

  const date = useMemo(
    () => getBoxEventLastDate(lastEvent),
    [lastEvent],
  );

  if (isNil(id)) {
    return null;
  }

  return (
    <ListItem key={id} {...linkProps} {...omitTranslationProps(rest)}>
      <ListItemAvatar>
        <Badge
          badgeContent={badgeContent}
        >
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
            {!lostKey && (
              <TypographyDateSince
                date={date}
              />
            )}
          </Box>
        )}
        secondary={secondary}
        primaryTypographyProps={{ noWrap: true, display: 'block' }}
        secondaryTypographyProps={{ noWrap: true, display: 'block', component: Box }}
      />
    </ListItem>
  );
}

BoxListItem.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes),
  toRoute: PropTypes.string,
  // withTranslation
  t: PropTypes.func.isRequired,
};

BoxListItem.defaultProps = {
  box: null,
  toRoute: null,
};

export default withTranslation('common')(BoxListItem);
