import React, { useState, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import isFunction from '@misakey/helpers/isFunction';

import CreateBoxDialog from 'components/smart/Dialog/Boxes/Create';

// COMPONENTS
const withDialogCreate = (Component, DialogComponent = CreateBoxDialog) => {
  let Wrapper = ({
    onClick,
    dialogProps,
    ...props
  }, ref) => {
    const [isDialogCreateOpen, setIsDialogCreateOpen] = useState(false);

    const toggleIsDialogCreateOpen = useCallback(
      () => { setIsDialogCreateOpen((current) => !current); }, [],
    );

    const onWrapperClick = useCallback(
      (...args) => {
        setIsDialogCreateOpen(true);

        if (isFunction(onClick)) {
          onClick(...args);
        }
      },
      [onClick],
    );

    return (
      <>
        <DialogComponent
          open={isDialogCreateOpen}
          onClose={toggleIsDialogCreateOpen}
          {...dialogProps}
        />
        <Component ref={ref} onClick={onWrapperClick} {...props} />
      </>
    );
  };

  Wrapper = forwardRef(Wrapper);

  Wrapper.propTypes = {
    onClick: PropTypes.func,
    dialogProps: PropTypes.shape({
      onSuccess: PropTypes.func,
    }),
  };

  Wrapper.defaultProps = {
    onClick: null,
    dialogProps: {},
  };

  return Wrapper;
};

export default withDialogCreate;
