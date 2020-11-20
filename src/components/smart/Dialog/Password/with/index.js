import React, { useState, useMemo, useCallback, useContext, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { UserManagerContext } from '@misakey/auth/components/OidcProvider/Context';

import isFunction from '@misakey/helpers/isFunction';
import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import { selectors } from '@misakey/crypto/store/reducers';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';


import DialogOpenVault from 'components/smart/Dialog/Password/OpenVault';

// CONSTANTS
const {
  identifierValue: IDENTIFIER_VALUE_SELECTOR,
  accountId: ACCOUNT_ID_SELECTOR,
} = authSelectors;

// COMPONENTS
const withDialogPassword = (Component) => {
  let Wrapper = ({
    onClick,
    dialogProps,
    forceDialog,
    ...props
  }, ref) => {
    const { askSigninRedirect } = useContext(UserManagerContext);

    const [open, setOpen] = useState(false);

    const accountId = useSelector(ACCOUNT_ID_SELECTOR);
    const identifierValue = useSelector(IDENTIFIER_VALUE_SELECTOR);

    const loginHint = useMemo(
      () => (isNil(identifierValue)
        ? ''
        : JSON.stringify({ identifier: identifierValue })),
      [identifierValue],
    );

    const hasAccountId = useMemo(
      () => !isNil(accountId),
      [accountId],
    );

    const isCryptoLoadedSelector = useMemo(
      () => selectors.isCryptoLoaded, [],
    );
    const isCryptoLoaded = useSelector(isCryptoLoadedSelector);

    const onWrapperClick = useCallback(
      (e) => {
        if (!hasAccountId) {
          askSigninRedirect({ acrValues: 2, prompt: 'login', loginHint });
        } else if (!isCryptoLoaded || forceDialog) {
          setOpen(true);
        } else if (isFunction(onClick)) {
          onClick(e);
        }
      },
      [hasAccountId, isCryptoLoaded, forceDialog, onClick, askSigninRedirect, loginHint],
    );

    const onClose = useCallback(
      () => { setOpen(false); },
      [],
    );

    return (
      <>
        {hasAccountId && (
          <DialogOpenVault
            open={open}
            onClose={onClose}
            onSuccess={onClick}
            skipUpdate={isCryptoLoaded && forceDialog}
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
    forceDialog: PropTypes.bool,
  };

  Wrapper.defaultProps = {
    onClick: null,
    dialogProps: {},
    forceDialog: false,
  };

  return Wrapper;
};

export default withDialogPassword;
