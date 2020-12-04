import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import ListItemAccessLevelSkeleton from 'components/dumb/ListItem/AccessLevel/Skeleton';
import SharingFormWhitelistSkeleton from 'components/screens/app/Boxes/Read/Sharing/Form/Whitelist/Skeleton';

// COMPONENTS
const AccessLevelFormSkeleton = ({ children }) => (
  <>
    <Box my={2}>
      <SharingFormWhitelistSkeleton />
    </Box>
    {children}
    <ListItemAccessLevelSkeleton />
  </>
);

AccessLevelFormSkeleton.propTypes = {
  children: PropTypes.node,
};

AccessLevelFormSkeleton.defaultProps = {
  children: null,
};

export default AccessLevelFormSkeleton;
