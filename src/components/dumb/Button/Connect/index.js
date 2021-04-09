import React, { useCallback, forwardRef, useContext } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import isFunction from '@misakey/core/helpers/isFunction';
import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import { UserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';

// COMPONENTS
const ButtonConnect = forwardRef(
  ({ authProps, children, onClick, t, ...props }, ref) => {
    const { userManager } = useContext(UserManagerContext);

    const onButtonClick = useCallback(
      (...args) => {
        if (isFunction(onClick)) {
          onClick(...args);
        }
        userManager.signinRedirect(authProps);
      },
      [onClick, userManager, authProps],
    );

    return (
      <Button
        ref={ref}
        onClick={onButtonClick}
        text={t('components:buttonConnect.signIn')}
        standing={BUTTON_STANDINGS.MAIN}
        {...omitTranslationProps(props)}
      />
    );
  },
);

ButtonConnect.propTypes = {
  t: PropTypes.func.isRequired,
  onClick: PropTypes.func,
  authProps: PropTypes.shape({
    acrValues: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    scope: PropTypes.string,
  }),
  children: PropTypes.node,
};

ButtonConnect.defaultProps = {
  children: null,
  onClick: null,
  authProps: {},
};

export default withTranslation('components', { withRef: true })(ButtonConnect);
