import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Avatar from '@misakey/ui/Avatar';
import Skeleton from '@material-ui/lab/Skeleton';

const ListItemAccessLevelSkeleton = (props) => (
  <ListItem {...props}>
    <ListItemIcon>
      <Skeleton variant="circle"><Avatar /></Skeleton>
    </ListItemIcon>
    <ListItemText
      primary={<Skeleton width={100} />}
      secondary={<Skeleton width={200} />}
    />
  </ListItem>
);

export default ListItemAccessLevelSkeleton;
