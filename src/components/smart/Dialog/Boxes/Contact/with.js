import React, { useState, useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import isFunction from '@misakey/core/helpers/isFunction';
import { selectors } from '@misakey/react/auth/store/reducers/auth';

import ContactBoxDialog from 'components/smart/Dialog/Boxes/Contact';
import { useSetPasswordContext } from '@misakey/react/auth/components/Dialog/Password/Create/Context';
import useAskSigninWithLoginHint from '@misakey/react/auth/hooks/useAskSigninWithLoginHint';

// COMPONENTS
const withDialogContact = (Component) => {
  let Wrapper = ({
    onClick,
    dialogProps,
    ...props
  }, ref) => {
    const [isDialogContactOpened, setIsDialogContactOpened] = useState(false);

    const { onOpenSetPasswordDialog } = useSetPasswordContext();
    const askSigninWithLoginHint = useAskSigninWithLoginHint();

    const isAuthenticated = useSelector(selectors.isAuthenticated);
    const hasCrypto = useSelector(selectors.hasCrypto);

    const toggleIsDialogContactOpened = useCallback(
      () => { setIsDialogContactOpened((current) => !current); }, [],
    );

    const onWrapperClick = useCallback(
      (...args) => {
        if (!isAuthenticated) {
          askSigninWithLoginHint({ extraStateParams: { shouldCreateAccount: true } });
          return;
        }
        if (!hasCrypto) {
          onOpenSetPasswordDialog();
          return;
        }
        setIsDialogContactOpened(true);

        if (isFunction(onClick)) {
          onClick(...args);
        }
      },
      [askSigninWithLoginHint, hasCrypto, isAuthenticated, onClick, onOpenSetPasswordDialog],
    );

    return (
      <>
        <ContactBoxDialog
          open={isDialogContactOpened}
          onClose={toggleIsDialogContactOpened}
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
      targetUser: PropTypes.shape({
        identityId: PropTypes.string.isRequired,
        profile: PropTypes.object.isRequired,
      }),
    }),
  };

  Wrapper.defaultProps = {
    onClick: null,
    dialogProps: {},
  };

  return Wrapper;
};

export default withDialogContact;
