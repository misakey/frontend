import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import {
  ACCESS_STATUS_NEEDS_LINK,
} from '@misakey/ui/constants/accessStatus';
import { EMAIL_DOMAIN } from '@misakey/ui/constants/accessTypes';

import partition from '@misakey/helpers/partition';
import isEmpty from '@misakey/helpers/isEmpty';
import getAccessStatus from '@misakey/helpers/getAccessStatus';

import BoxMessage from '@misakey/ui/Box/Message';

// COMPONENTS
const BoxMessageWhitelist = ({ whitelist, ...props }) => {
  const [whitelistDomains, whitelistUsers] = useMemo(
    () => partition(whitelist, ({ restrictionType }) => restrictionType === EMAIL_DOMAIN),
    [whitelist],
  );

  const hasDomains = useMemo(
    () => !isEmpty(whitelistDomains),
    [whitelistDomains],
  );

  const hasLinkRequiredUsers = useMemo(
    () => whitelistUsers.some((whitelistUser) => {
      const accessStatus = getAccessStatus(whitelistUser);
      return accessStatus === ACCESS_STATUS_NEEDS_LINK;
    }),
    [whitelistUsers],
  );

  if (!hasDomains && !hasLinkRequiredUsers) {
    return null;
  }

  return (
    <BoxMessage
      {...props}
    />
  );
};

BoxMessageWhitelist.propTypes = {
  whitelist: PropTypes.arrayOf(PropTypes.shape({
    restrictionType: PropTypes.string,
  })),
};

BoxMessageWhitelist.defaultProps = {
  whitelist: [],
};

export default BoxMessageWhitelist;
