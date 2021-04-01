import React, { useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import objectToSnakeCase from '@misakey/core/helpers/objectToSnakeCase';
import isFunction from '@misakey/core/helpers/isFunction';
import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';
import useAskSigninWithLoginHint from '@misakey/react-auth/hooks/useAskSigninWithLoginHint';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// COMPONENTS
const ButtonConnect = forwardRef(
  ({ authProps, children, onClick, t, ...props }, ref) => {
    const askSigninWithLoginHint = useAskSigninWithLoginHint();

    const onButtonClick = useCallback(
      (...args) => {
        if (isFunction(onClick)) {
          onClick(...args);
        }
        askSigninWithLoginHint(objectToSnakeCase(authProps));
      },
      [authProps, onClick, askSigninWithLoginHint],
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
