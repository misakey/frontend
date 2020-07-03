import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';

import BoxesSchema from 'store/schemas/Boxes';

import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import Skeleton from '@material-ui/lab/Skeleton';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Chip from '@material-ui/core/Chip';
import BoxAvatar from 'components/dumb/Avatar/Box';
import TypographyDateSince from 'components/dumb/Typography/DateSince';
import BoxEventsAccordingToType from 'components/smart/Box/Event';

// COMPONENTS
export const BoxListItemSkeleton = (props) => (
  <ListItem {...props}>
    <ListItemAvatar>
      <Skeleton
        variant="circle"
        width={40}
        height={40}
      />
    </ListItemAvatar>
    <ListItemText
      primary={(
        <Skeleton
          component="span"
          variant="text"
          width="50%"
        />
      )}
      secondary={(
        <Skeleton
          component="span"
          variant="text"
          width="50%"
        />
      )}
    />
    <Box display="flex" flexDirection="column" alignItems="end">
      <Skeleton
        variant="text"
        width={30}
      />
    </Box>
  </ListItem>
);

function BoxListItem({ box, toRoute, t, ...rest }) {
  const {
    id,
    logoUri,
    title,
    lastEvent = {},
    blobCount = 0,
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
    () => (
      <BoxEventsAccordingToType event={lastEvent} preview />
    ), [lastEvent],
  );

  if (isNil(id)) {
    return null;
  }

  return (
    <ListItem key={id} {...linkProps} {...omitTranslationProps(rest)}>
      <ListItemAvatar>
        <BoxAvatar
          src={logoUri}
          title={title}
        />
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={secondary}
        primaryTypographyProps={{ noWrap: true, display: 'block' }}
        secondaryTypographyProps={{ noWrap: true, display: 'block' }}
      />
      <Box display="flex" flexDirection="column" alignItems="end">
        {(blobCount > 0) && (
          <Box>
            <Chip color="secondary" label={blobCount} size="small" clickable />
          </Box>
        )}
        <TypographyDateSince
          noWrap
          date={lastEvent.serverEventCreatedAt}
          color="textSecondary"
        />
      </Box>

    </ListItem>
  );
}

BoxListItem.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes),
  toRoute: PropTypes.string,
  t: PropTypes.func.isRequired,
};

BoxListItem.defaultProps = {
  box: null,
  toRoute: null,
};

export default withTranslation('citizen')(BoxListItem);
