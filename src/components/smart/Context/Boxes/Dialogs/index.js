import React from 'react';
import PropTypes from 'prop-types';

import DialogBoxesDeleteContextProvider from 'components/smart/Dialog/Boxes/Delete/Context';
import DialogBoxesLeaveContextProvider from 'components/smart/Dialog/Boxes/Leave/Context';

// COMPONENTS
const ContextBoxDialogs = ({ canLeave, canDelete, children, ...rest }) => {
  if (canLeave && canDelete) {
    return (
      <DialogBoxesLeaveContextProvider {...rest}>
        <DialogBoxesDeleteContextProvider {...rest}>
          {children}
        </DialogBoxesDeleteContextProvider>
      </DialogBoxesLeaveContextProvider>
    );
  }
  if (canLeave) {
    return (
      <DialogBoxesLeaveContextProvider {...rest}>
        {children}
      </DialogBoxesLeaveContextProvider>
    );
  }
  if (canDelete) {
    return (
      <DialogBoxesDeleteContextProvider {...rest}>
        {children}
      </DialogBoxesDeleteContextProvider>
    );
  }
  return children;
};

ContextBoxDialogs.propTypes = {
  canLeave: PropTypes.bool,
  canDelete: PropTypes.bool,
  children: PropTypes.node,
};

ContextBoxDialogs.defaultProps = {
  canLeave: false,
  canDelete: false,
  children: null,
};

export default ContextBoxDialogs;
