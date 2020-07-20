import React, { useState, useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import isFunction from '@misakey/helpers/isFunction';
import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import { selectors } from '@misakey/crypto/store/reducers';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import DialogCreatePassword from 'components/smart/Dialog/Password/Create';
import DialogOpenVault from 'components/smart/Dialog/Password/OpenVault';

// COMPONENTS
const withDialogPassword = (Component) => {
  let Wrapper = ({
    onClick,
    dialogProps,
    ...props
  }, ref) => {
    const [open, setOpen] = useState(false);

    const { accountId } = useSelector(getCurrentUserSelector) || {};

    const hasAccountId = useMemo(
      () => !isNil(accountId),
      [accountId],
    );

    const isCryptoLoadedSelector = useMemo(
      () => selectors.isCryptoLoaded, [],
    );
    const isCryptoLoaded = useSelector(isCryptoLoadedSelector);

    const onWrapperClick = useCallback(
      (...args) => {
        if (!hasAccountId || !isCryptoLoaded) {
          setOpen(true);
        } else if (isFunction(onClick)) {
          onClick(...args);
        }
      },
      [hasAccountId, isCryptoLoaded, onClick],
    );

    const onClose = useCallback(
      () => { setOpen(false); },
      [],
    );

    return (
      <>
        {hasAccountId ? (
          <DialogOpenVault
            open={open}
            onClose={onClose}
            onSuccess={onClick}
            {...dialogProps}
          />
        ) : (
          <DialogCreatePassword
            open={open}
            onClose={onClose}
            onSuccess={onClick}
            {...dialogProps}
          />
        )}
        <Component ref={ref} onClick={onWrapperClick} {...omitTranslationProps(props)} />
      </>
    );
  };

  Wrapper = forwardRef(Wrapper);

  Wrapper.propTypes = {
    onClick: PropTypes.func,
    dialogProps: PropTypes.shape({
      onClose: PropTypes.func,
      onSubmit: PropTypes.func,
      open: PropTypes.bool,
    }),
  };

  Wrapper.defaultProps = {
    onClick: null,
    dialogProps: {},
  };

  return Wrapper;
};

export default withDialogPassword;
