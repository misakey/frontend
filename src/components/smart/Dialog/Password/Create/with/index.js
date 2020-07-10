import React, { useState, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';

import DialogPasswordCreate from 'components/smart/Dialog/Password/Create';


const withDialogPasswordCreate = (Component) => {
  let Wrapper = ({
    onClick,
    dialogProps,
    ...props
  }, ref) => {
    const [open, setOpen] = useState(false);

    const onWrapperClick = useCallback(
      () => {
        setOpen(true);
      },
      [setOpen],
    );

    const onClose = useCallback(
      () => { setOpen(false); },
      [setOpen],
    );

    return (
      <>
        <DialogPasswordCreate
          open={open}
          onClose={onClose}
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
      open: PropTypes.bool,
      onClose: PropTypes.func,
      onSubmit: PropTypes.func,
    }),
  };

  Wrapper.defaultProps = {
    onClick: null,
    dialogProps: {},
  };

  return Wrapper;
};

export default withDialogPasswordCreate;
