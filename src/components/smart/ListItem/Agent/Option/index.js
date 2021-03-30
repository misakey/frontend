import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import {
  ADMIN, AGENT,
} from '@misakey/ui/constants/organizations/roles';

import isNil from '@misakey/helpers/isNil';

import { useTranslation } from 'react-i18next';

import ListItemUser from '@misakey/ui/ListItem/User';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Box from '@material-ui/core/Box';
import Subtitle from '@misakey/ui/Typography/Subtitle';


// COMPONENTS
const ListItemAgentOption = ({
  identifier,
  isAdmin,
  isMember,
  onRemove,
  ...rest }) => {
  const { t } = useTranslation('organizations');

  const role = useMemo(
    () => {
      if (isAdmin) {
        return ADMIN;
      }
      if (isMember) {
        return AGENT;
      }
      return null;
    },
    [isAdmin, isMember],
  );

  return (
    <ListItemUser
      component="div"
      {...rest}
      identifier={identifier}
    >
      {!isNil(role) && (
        <Box
          component={ListItemSecondaryAction}
          display="flex"
          alignItems="center"
        >
          <Subtitle color="textSecondary">
            {t(`organizations:agents.role.${role}`)}
          </Subtitle>
        </Box>
      )}
    </ListItemUser>
  );
};

ListItemAgentOption.propTypes = {
  identifier: PropTypes.string,
  isMember: PropTypes.bool,
  isAdmin: PropTypes.bool,
  onRemove: PropTypes.func,
};

ListItemAgentOption.defaultProps = {
  identifier: '',
  isMember: false,
  isAdmin: false,
  onRemove: null,
};

export default ListItemAgentOption;
