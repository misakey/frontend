import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import UserSchema from '@misakey/react-auth/store/schemas/User';
import { VISIBLE_ROLES } from '@misakey/ui/constants/organizations/roles';

import { pickUsersPropsRemapIdentifier } from '@misakey/core/helpers/user';

import ListItemUser from '@misakey/ui/ListItem/User';
import ListItemSecondaryActionAgent from 'components/smart/ListItemSecondaryAction/Agent';

// COMPONENTS
const ListItemAgent = ({
  id, role, isNew, organizationId, identityId, createdAt,
  onRemove, identity, ...props
}) => {
  const userProps = useMemo(
    () => pickUsersPropsRemapIdentifier(identity),
    [identity],
  );
  return (
    <ListItemUser {...userProps} {...props}>
      <ListItemSecondaryActionAgent id={id} onRemove={onRemove} isNew={isNew} role={role} />
    </ListItemUser>
  );
};

ListItemAgent.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  role: PropTypes.oneOf(VISIBLE_ROLES),
  isNew: PropTypes.bool,
  organizationId: PropTypes.string,
  identityId: PropTypes.string,
  createdAt: PropTypes.string,
  identity: PropTypes.shape(UserSchema.propTypes).isRequired,
  onRemove: PropTypes.func,
};

ListItemAgent.defaultProps = {
  onRemove: null,
  role: undefined,
  isNew: false,
  organizationId: null,
  identityId: null,
  createdAt: null,
};

export default ListItemAgent;
