import React, { useState, useMemo, useCallback, Suspense } from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';

import SearchApplicationsFab from './Fab';
import SearchApplicationsPopover from './Popover';

// COMPONENTS
const SearchApplications = ({ component: Component, children, popoverProps, ...rest }) => {
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
      <Suspense fallback={null}>
        <SearchApplicationsPopover
          id={id}
          anchorEl={anchorEl}
          onClose={onClose}
          {...popoverProps}
        />
      </Suspense>
    </>
  );
};

SearchApplications.propTypes = {
  component: PropTypes.elementType,
  children: PropTypes.node,
  popoverProps: PropTypes.object,
};

SearchApplications.defaultProps = {
  component: SearchApplicationsFab,
  popoverProps: {},
  children: null,
};

export default SearchApplications;
