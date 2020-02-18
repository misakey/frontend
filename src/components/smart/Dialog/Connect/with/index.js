import React, { useState, useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';

import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';

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
    const location = useLocation();

    const onWrapperClick = useCallback(
      (...args) => {
        if (!isAuthenticated) {
          setOpen(true);
        } else if (isFunction(onClick)) {
          onClick(...args);
        }
      },
      [onClick, isAuthenticated, setOpen],
    );

    const onClose = useCallback(
      () => { setOpen(false); },
      [setOpen],
    );

    const wrapperLinkProps = useMemo(
      () => {
        if (!isNil(to) || !isNil(replace)) {
          return (!isAuthenticated
            ? {
              // give a to prop to Link component to avoid error,
              // but force replace to current location
              to: location,
              replace: true,
            } : {
              to,
              replace,
            });
        }
        return {};
      },
      [isAuthenticated, location, to, replace],
    );

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
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
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
    const { token } = state.auth;
    return {
      isAuthenticated: !!token,
    };
  };
  return connect(mapStateToProps, {}, null, { forwardRef: true })(Wrapper);
};

export default withDialogConnect;
