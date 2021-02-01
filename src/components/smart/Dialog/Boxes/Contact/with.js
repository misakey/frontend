import React, { useState, useCallback, forwardRef, useContext } from 'react';

import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import isFunction from '@misakey/helpers/isFunction';
import { selectors } from '@misakey/react-auth/store/reducers/auth';

import ContactBoxDialog from 'components/smart/Dialog/Boxes/Contact';
import { UserManagerContext } from '@misakey/react-auth/components/OidcProvider/Context';
import DialogSigninRedirect from '@misakey/react-auth/components/OidcProvider/Dialog/SigninRedirect';
import routes from 'routes';

// COMPONENTS
const withDialogContact = (Component) => {
  let Wrapper = ({
    onClick,
    dialogProps,
    ...props
  }, ref) => {
    const [isDialogContactOpened, setIsDialogContactOpened] = useState(false);
    const [isDialogAuthRequiredOpened, setIsDialogAuthRequiredOpened] = useState(false);

    const isAuthenticated = useSelector(selectors.isAuthenticated);
    const hasAccount = useSelector(selectors.hasAccount);
    const { userManager } = useContext(UserManagerContext);

    const toggleIsDialogContactOpened = useCallback(
      () => { setIsDialogContactOpened((current) => !current); }, [],
    );

    const toggleIsDialogAuthRequiredOpened = useCallback(
      () => { setIsDialogAuthRequiredOpened((current) => !current); }, [],
    );

    const onWrapperClick = useCallback(
      (...args) => {
        if (!isAuthenticated || !hasAccount) {
          setIsDialogAuthRequiredOpened(true);
          return;
        }
        setIsDialogContactOpened(true);

        if (isFunction(onClick)) {
          onClick(...args);
        }
      },
      [hasAccount, isAuthenticated, onClick],
    );

    return (
      <>
        <ContactBoxDialog
          open={isDialogContactOpened}
          onClose={toggleIsDialogContactOpened}
          {...dialogProps}
        />
        <DialogSigninRedirect
          open={isDialogAuthRequiredOpened}
          onClose={toggleIsDialogAuthRequiredOpened}
          userManager={userManager}
          canCancelRedirect
          publicRoute={routes.identities.public}
          acrValues={2}
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
