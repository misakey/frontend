import PropTypes from 'prop-types';

import AvatarUserSkeleton from '@misakey/ui/Avatar/User/Skeleton';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Skeleton from '@material-ui/lab/Skeleton';

// COMPONENTS
const ListItemUserSkeleton = ({ children, ...rest }) => (
  <ListItem {...rest}>
    <ListItemAvatar>
      <AvatarUserSkeleton />
    </ListItemAvatar>
    <ListItemText
      primary={<Skeleton width={100} />}
      secondary={<Skeleton width={200} />}
      primaryTypographyProps={{ color: 'textPrimary' }}
      secondaryTypographyProps={{ color: 'textSecondary' }}
    />
    {children}
  </ListItem>
);

ListItemUserSkeleton.propTypes = {
  children: PropTypes.node,
};

ListItemUserSkeleton.defaultProps = {
  children: null,
};

export default ListItemUserSkeleton;
