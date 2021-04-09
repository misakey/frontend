import React, { useState, useMemo, useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { TO_PROP_TYPE } from '@misakey/ui/constants/propTypes';

import { selectors } from '@misakey/react/crypto/store/reducers';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import isFunction from '@misakey/core/helpers/isFunction';
import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import { useSelector } from 'react-redux';
import useAskToSetPassword from '@misakey/react/auth/hooks/useAskToSetPassword';
import useLinkCondition from '@misakey/hooks/useLinkCondition';

import DialogOpenVault from '@misakey/react/auth/components/Dialog/Password/OpenVault';

// CONSTANTS
const {
  hasCrypto: HAS_CRYPTO_SELECTOR,
} = authSelectors;

// COMPONENTS
const withDialogPassword = (Component) => {
  let Wrapper = ({
    onClick,
    to,
    replace,
    dialogProps,
    forceDialog,
    ...props
  }, ref) => {
    const askToSetPassword = useAskToSetPassword();

    const [open, setOpen] = useState(false);

    const hasCrypto = useSelector(HAS_CRYPTO_SELECTOR);

    const isCryptoLoadedSelector = useMemo(
      () => selectors.isCryptoLoaded, [],
    );
    const isCryptoLoaded = useSelector(isCryptoLoadedSelector);

    const onWrapperClick = useCallback(
      (e) => {
        if (!hasCrypto) {
          askToSetPassword();
        } else if (!isCryptoLoaded || forceDialog) {
          setOpen(true);
        } else if (isFunction(onClick)) {
          onClick(e);
        }
      },
      [hasCrypto, isCryptoLoaded, forceDialog, onClick, askToSetPassword],
    );

    const wrapperLinkProps = useLinkCondition(
      hasCrypto && isCryptoLoaded && !forceDialog,
      to,
      replace,
    );

    const onClose = useCallback(
      () => { setOpen(false); },
      [],
    );

    return (
      <>
        {hasCrypto && (
          <DialogOpenVault
            open={open}
            onClose={onClose}
            onSuccess={onClick}
            skipUpdate={isCryptoLoaded && forceDialog}
            {...dialogProps}
          />
        )}
        <Component
          ref={ref}
          onClick={onWrapperClick}
          {...wrapperLinkProps}
          {...omitTranslationProps(props)}
        />
      </>
    );
  };

  Wrapper = forwardRef(Wrapper);

  Wrapper.propTypes = {
    onClick: PropTypes.func,
    to: TO_PROP_TYPE,
    replace: PropTypes.bool,
    dialogProps: PropTypes.shape({
      onClose: PropTypes.func,
      onSubmit: PropTypes.func,
      open: PropTypes.bool,
    }),
    forceDialog: PropTypes.bool,
  };

  Wrapper.defaultProps = {
    onClick: null,
    to: null,
    replace: undefined,
    dialogProps: {},
    forceDialog: false,
  };

  return Wrapper;
};

export default withDialogPassword;
