import React, { useState, useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { TO_PROP_TYPE } from '@misakey/ui/constants/propTypes';

import useClickWrapper from '@misakey/hooks/useClickWrapper';
import useLinkCondition from '@misakey/hooks/useLinkCondition';

import DialogConnect from 'components/smart/Dialog/Connect';

// COMPONENTS
const withDialogConnect = (Component) => {
  let Wrapper = ({
    isAuthenticated,
    onClick,
    to,
    replace,
    dialogConnectProps,
    ...props
  }, ref) => {
    const [open, setOpen] = useState(false);

    const onNotAuthenticated = useCallback(
      () => setOpen(true),
      [setOpen],
    );

    const onWrapperClick = useClickWrapper(!isAuthenticated, onClick, onNotAuthenticated);

    const onClose = useCallback(
      () => { setOpen(false); },
      [setOpen],
    );

    const wrapperLinkProps = useLinkCondition(isAuthenticated, to, replace);

    return (
      <>
        <DialogConnect open={open} onClose={onClose} {...dialogConnectProps} />
        <Component ref={ref} onClick={onWrapperClick} {...wrapperLinkProps} {...props} />
      </>
    );
  };

  Wrapper = forwardRef(Wrapper);

  Wrapper.propTypes = {
    isAuthenticated: PropTypes.bool,
    onClick: PropTypes.func,
    to: TO_PROP_TYPE,
    replace: PropTypes.bool,
    dialogConnectProps: PropTypes.object,
  };

  Wrapper.defaultProps = {
    isAuthenticated: false,
    onClick: null,
    to: null,
    replace: undefined,
    dialogConnectProps: {},
  };

  // CONNECT
  const mapStateToProps = (state) => {
    const { isAuthenticated } = state.auth;
    return {
      isAuthenticated,
    };
  };
  return connect(mapStateToProps, {}, null, { forwardRef: true })(Wrapper);
};

export default withDialogConnect;
