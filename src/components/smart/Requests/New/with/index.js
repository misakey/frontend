import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generatePath, useHistory } from 'react-router-dom';

import routes from 'routes';
import { PORTABILITY } from 'constants/databox/type';


import isFunction from '@misakey/helpers/isFunction';

import NewRequestRedirect from 'components/smart/Requests/New';

// COMPONENTS
// @FIXME: name doesn't match file name
const withRequestCreation = (Component) => {
  const Wrapper = ({ onClick, onSuccess, producerId, type, redirectProps, disabled, ...props }) => {
    const { push } = useHistory();

    const [inProgress, setInProgress] = useState(false);

    const disabledOrInProgress = useMemo(
      () => disabled || inProgress,
      [disabled, inProgress],
    );

    const onWrapperClick = useCallback(() => {
      setInProgress(true);
      if (isFunction(onClick)) {
        onClick();
      }
    },
    [onClick]);

    const handleError = useCallback(() => { setInProgress(false); }, []);

    const onRequestCreateSuccess = useCallback(
      ({ id: requestId }) => {
        const goTo = generatePath(routes.citizen.requests.read, { id: requestId });
        push(goTo);
      },
      [push],
    );

    const handleSuccess = useCallback(
      (...args) => {
        // @FIXME should we keep the Component disabled after we created the request ?
        setInProgress(false);
        if (isFunction(onSuccess)) {
          onSuccess(...args);
        } else if (onSuccess !== false) {
          onRequestCreateSuccess(...args);
        }
      },
      [onRequestCreateSuccess, onSuccess],
    );

    return (
      <>
        {inProgress && (
          <NewRequestRedirect
            type={type}
            producerId={producerId}
            onCreateError={handleError}
            onCreateSuccess={handleSuccess}
            {...redirectProps}
          />
        )}
        <Component
          onClick={onWrapperClick}
          disabled={disabledOrInProgress}
          {...props}
        />
      </>
    );
  };

  Wrapper.propTypes = {
    onClick: PropTypes.func,
    onSuccess: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
    producerId: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
    type: PropTypes.string,
    redirectProps: PropTypes.object,
    disabled: PropTypes.bool,
  };

  Wrapper.defaultProps = {
    onClick: null,
    onSuccess: null,
    type: PORTABILITY,
    children: null,
    redirectProps: {},
    disabled: false,
  };

  return Wrapper;
};

export default withRequestCreation;
