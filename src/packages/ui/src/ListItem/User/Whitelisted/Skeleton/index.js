import React from 'react';

import ListItemUserSkeleton from '@misakey/ui/ListItem/User/Skeleton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Box from '@material-ui/core/Box';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Skeleton from '@material-ui/lab/Skeleton';

// COMPONENTS
const ListItemUserWhitelistedSkeleton = (props) => (
  <ListItemUserSkeleton {...props}>
    <Box component={ListItemSecondaryAction} display="flex" alignItems="center">
      <Subtitle>
        <Skeleton variant="text" width={50} />
      </Subtitle>
    </Box>
  </ListItemUserSkeleton>
);

export default ListItemUserWhitelistedSkeleton;
