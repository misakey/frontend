import PropTypes from 'prop-types';

import BoxSchema from 'store/schemas/Boxes';

import useBoxBelongsToCurrentUser from 'hooks/useBoxBelongsToCurrentUser';

import ListItemMember from 'components/dumb/ListItem/Member';

// COMPONENTS
const ListItemMemberBelongsToCurrentUser = ({ box, ...props }) => {
  const belongsToCurrentUser = useBoxBelongsToCurrentUser(box);

  return <ListItemMember belongsToCurrentUser={belongsToCurrentUser} box={box} {...props} />;
};

ListItemMemberBelongsToCurrentUser.propTypes = {
  box: PropTypes.shape(BoxSchema.propTypes).isRequired,
};

export default ListItemMemberBelongsToCurrentUser;
