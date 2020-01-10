import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';

import SearchApplicationsButton from './Button';
import SearchApplicationsPopover from './Popover';

// COMPONENTS
const SearchApplications = ({ component: Component, children, ...rest }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const id = useMemo(
    () => (!isNil(anchorEl) ? 'search-applications-popover' : undefined),
    [anchorEl],
  );

  const onClose = useCallback(
    () => {
      setAnchorEl(null);
    },
    [setAnchorEl],
  );

  const onClick = useCallback(
    (event) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl],
  );

  return (
    <>
      <Component
        aria-describedby={id}
        onClick={onClick}
        {...rest}
      >
        {children}
      </Component>
      <SearchApplicationsPopover
        id={id}
        anchorEl={anchorEl}
        onClose={onClose}
      />
    </>
  );
};

SearchApplications.propTypes = {
  component: PropTypes.elementType,
  children: PropTypes.node,
};

SearchApplications.defaultProps = {
  component: SearchApplicationsButton,
  children: null,
};

export default SearchApplications;
