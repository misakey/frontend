import PropTypes from 'prop-types';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import CodeIcon from '@material-ui/icons/Code';
import DescriptionIcon from '@material-ui/icons/Description';
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';

const AuthErrorDetails = ({ code, description, details, location }) => (
  <List>
    <ListItem>
      <ListItemIcon>
        <CodeIcon />
      </ListItemIcon>
      <ListItemText primary={code} />
    </ListItem>
    <ListItem>
      <ListItemIcon>
        <DescriptionIcon />
      </ListItemIcon>
      <ListItemText primary={description} />
    </ListItem>
    <ListItem>
      <ListItemIcon>
        <LocationSearchingIcon />
      </ListItemIcon>
      <ListItemText primary={location} />
    </ListItem>
    {details.map(([key, value]) => (
      <ListItem key={key}>
        <ListItemText primary={key} secondary={value} />
      </ListItem>
    ))}
  </List>
);

AuthErrorDetails.propTypes = {
  code: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  details: PropTypes.arrayOf(PropTypes.array),
  location: PropTypes.string.isRequired,
};

AuthErrorDetails.defaultProps = {
  details: [],
};

export default AuthErrorDetails;
