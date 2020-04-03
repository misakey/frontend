import React, { useContext, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';

import ApplicationSchema from 'store/schemas/Application';

import isFunction from '@misakey/helpers/isFunction';

import { UserContributionContext } from 'components/smart/Dialog/UserContribution/Context/Provider/';
import { USER_CONTRIBUTION_TYPES } from 'components/smart/Dialog/UserContribution';

// COMPONENTS
const withUserContributionContextConsumer = (Component) => {
  let Wrapper = ({
    onClick,
    entity,
    dialogProps,
    ...props
  }, ref) => {
    const { onContribute } = useContext(UserContributionContext);

    const onWrapperClick = useCallback(
      (...args) => {
        onContribute({ entity, dialogProps });
        if (isFunction(onClick)) {
          onClick(...args);
        }
      },
      [dialogProps, entity, onClick, onContribute],
    );


    return (
      <Component ref={ref} onClick={onWrapperClick} {...props} />
    );
  };

  Wrapper = forwardRef(Wrapper);

  Wrapper.propTypes = {
    onClick: PropTypes.func,
    entity: PropTypes.shape(ApplicationSchema.propTypes),
    dialogProps: PropTypes.shape({
      onClose: PropTypes.func,
      onSuccess: PropTypes.func,
      open: PropTypes.bool,
      userContributionType: PropTypes.oneOf(USER_CONTRIBUTION_TYPES),
    }),
  };

  Wrapper.defaultProps = {
    onClick: null,
    entity: null,
    dialogProps: {},
  };

  return Wrapper;
};

export default withUserContributionContextConsumer;
