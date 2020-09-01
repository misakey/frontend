import React, { useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';

import isFunction from '@misakey/helpers/isFunction';
import log from '@misakey/helpers/log';

import { useContextMenuContext } from '@misakey/ui/Menu/ContextMenu/with';

import MenuItem from '@material-ui/core/MenuItem';

const ContextMenuItem = forwardRef(({ onClick, children, ...props }, ref) => {
  const { onClose } = useContextMenuContext();

  const handleClose = useCallback(
    () => {
      if (isFunction(onClose)) {
        onClose();
      } else {
        log('Context MenuItem expects a ContextMenu parent context', 'warn');
      }
    },
    [onClose],
  );

  const handleClick = useCallback(
    (e) => {
      if (isFunction(onClick)) {
        Promise.resolve(onClick(e))
          .then(handleClose);
      } else {
        handleClose();
      }
    },
    [handleClose, onClick],
  );

  return (
    <MenuItem
      ref={ref}
      onClick={handleClick}
      {...props}
    >
      {children}
    </MenuItem>
  );
});

ContextMenuItem.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
};

ContextMenuItem.defaultProps = {
  children: null,
  onClick: null,
};

export default ContextMenuItem;
