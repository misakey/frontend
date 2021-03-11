import React, { useState, useMemo, useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { TO_PROP_TYPE } from '@misakey/ui/constants/propTypes';

import { selectors } from '@misakey/crypto/store/reducers';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import isFunction from '@misakey/helpers/isFunction';
import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { useSelector } from 'react-redux';
import useCreateAccount from '@misakey/react-auth/hooks/useCreateAccount';
import useLinkCondition from '@misakey/hooks/useLinkCondition';

import DialogOpenVault from '@misakey/react-auth/components/Dialog/Password/OpenVault';

// CONSTANTS
const {
  accountId: ACCOUNT_ID_SELECTOR,
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
    const onCreateAccount = useCreateAccount();

    const [open, setOpen] = useState(false);

    const accountId = useSelector(ACCOUNT_ID_SELECTOR);

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
          onCreateAccount();
        } else if (!isCryptoLoaded || forceDialog) {
          setOpen(true);
        } else if (isFunction(onClick)) {
          onClick(e);
        }
      },
      [hasAccountId, isCryptoLoaded, forceDialog, onClick, onCreateAccount],
    );

    const wrapperLinkProps = useLinkCondition(
      hasAccountId && isCryptoLoaded && !forceDialog,
      to,
      replace,
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
