import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';

import isFunction from '@misakey/helpers/isFunction';

import DialogConnect from './index';

// COMPONENTS
const withDialogConnect = (Component) => {
  const Wrapper = ({ isAuthenticated, onClick, to, replace, ...props }) => {
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
      () => (!isAuthenticated ? {
        // give a to prop to Link component to avoid error, but force replace to current location
        to: location,
        replace: true,
      } : {
        to,
        replace,
      }),
      [isAuthenticated, location, to, replace],
    );

    return (
      <>
        <DialogConnect open={open} onClose={onClose} />
        <Component onClick={onWrapperClick} {...wrapperLinkProps} {...props} />
      </>
    );
  };

  Wrapper.propTypes = {
    isAuthenticated: PropTypes.bool,
    onClick: PropTypes.func,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    replace: PropTypes.bool,
  };

  Wrapper.defaultProps = {
    isAuthenticated: false,
    onClick: null,
    to: null,
    replace: undefined,
  };

  // CONNECT
  const mapStateToProps = (state) => {
    const { token } = state.auth;
    return {
      isAuthenticated: !!token,
    };
  };
  return connect(mapStateToProps, {})(Wrapper);
};

export default withDialogConnect;
