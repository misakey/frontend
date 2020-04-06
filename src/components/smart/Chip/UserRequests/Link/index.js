import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import getNextSearch from '@misakey/helpers/getNextSearch';

import { useLocation } from 'react-router-dom';

import ChipActive from 'components/dumb/Chip/Active';
import ChipLink from 'components/smart/Chip/Link';

const ChipLinkUserRequests = ({ value, searchKey, ...rest }) => {
  const { pathname, search } = useLocation();

  const to = useMemo(
    () => ({
      pathname,
      search: getNextSearch(search, new Map([
        [searchKey, value],
      ])),
    }),
    [pathname, search, searchKey, value],
  );

  return (
    <ChipLink
      component={ChipActive}
      value={value}
      to={to}
      {...rest}
    />
  );
};

ChipLinkUserRequests.propTypes = {
  value: PropTypes.string.isRequired,
  activeValue: PropTypes.string.isRequired,
  searchKey: PropTypes.string.isRequired,
};

export default ChipLinkUserRequests;
