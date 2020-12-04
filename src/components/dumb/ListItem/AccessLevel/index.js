import { forwardRef } from 'react';
import PropTypes from 'prop-types';

import SelectItemAccessLevel from 'components/dumb/SelectItem/AccessLevel';
import ListItem from '@material-ui/core/ListItem';
import ACCESS_LEVELS from '@misakey/ui/constants/accessLevels';

// COMPONENTS
const ListItemAccessLevel = forwardRef(({ value, ...props }, ref) => (
  <ListItem {...props} ref={ref}>
    <SelectItemAccessLevel value={value} />
  </ListItem>
));

ListItemAccessLevel.propTypes = {
  value: PropTypes.oneOf(ACCESS_LEVELS).isRequired,
};

export default ListItemAccessLevel;
