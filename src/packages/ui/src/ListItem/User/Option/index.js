import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import {
  ACCESS_STATUS_MEMBER, ACCESS_STATUS_NEEDS_LINK, ACCESS_STATUS_INVITED, ACCESS_STATUS_OWNER,
} from '@misakey/ui/constants/accessStatus';

import isNil from '@misakey/core/helpers/isNil';

import { useTranslation } from 'react-i18next';

import ListItemUser from '@misakey/ui/ListItem/User';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Box from '@material-ui/core/Box';
import Subtitle from '@misakey/ui/Typography/Subtitle';


// COMPONENTS
const ListItemUserOption = ({
  identifier,
  autoInvite,
  isOwner,
  isMember,
  needsLink,
  onRemove,
  ...rest }) => {
  const { t } = useTranslation(['components', 'common']);

  const accessStatus = useMemo(
    () => {
      if (isOwner) {
        return ACCESS_STATUS_OWNER;
      }
      if (isMember) {
        return ACCESS_STATUS_MEMBER;
      }
      if (autoInvite) {
        return ACCESS_STATUS_INVITED;
      }
      if (needsLink) {
        return ACCESS_STATUS_NEEDS_LINK;
      }
      return null;
    },
    [isOwner, isMember, autoInvite, needsLink],
  );

  return (
    <ListItemUser
      component="div"
      {...rest}
      identifier={identifier}
    >
      {!isNil(accessStatus) && (
        <Box
          component={ListItemSecondaryAction}
          display="flex"
          alignItems="center"
        >
          <Subtitle color="textSecondary">
            {t(`components:whitelist.${accessStatus}`)}
          </Subtitle>
        </Box>
      )}
    </ListItemUser>
  );
};

ListItemUserOption.propTypes = {
  identifier: PropTypes.string,
  autoInvite: PropTypes.bool,
  isMember: PropTypes.bool,
  isOwner: PropTypes.bool,
  needsLink: PropTypes.bool,
  onRemove: PropTypes.func,
};

ListItemUserOption.defaultProps = {
  identifier: '',
  autoInvite: false,
  isMember: false,
  isOwner: false,
  needsLink: false,
  onRemove: null,
};

export default ListItemUserOption;
