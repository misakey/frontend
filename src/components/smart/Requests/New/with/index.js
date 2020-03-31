import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import isFunction from '@misakey/helpers/isFunction';
import { PORTABILITY } from 'constants/databox/type';
import { makeStyles } from '@material-ui/core';
import NewRequestRedirect from 'components/smart/Requests/New';
import clsx from 'clsx';

const useStyles = makeStyles(() => ({
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  onProgress: {
    opacity: '0.5',
  },
}));

// COMPONENTS
const withRequestCreation = (Component) => {
  const Wrapper = ({ onClick, producerId, type, redirectProps, ...props }) => {
    const classes = useStyles();
    const [display, setDisplay] = useState(false);

    const onWrapperClick = useCallback(() => { setDisplay(true); }, []);

    const handleError = useCallback(() => { setDisplay(false); }, []);
    const handleSuccess = useCallback(
      () => { if (isFunction(onClick)) { onClick(); } },
      [onClick],
    );

    return (
      <div className={clsx({ [classes.onProgress]: display })}>
        {display && (
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
          {...props}
        />
      </div>
    );
  };

  Wrapper.propTypes = {
    onClick: PropTypes.func,
    producerId: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
    type: PropTypes.string,
    redirectProps: PropTypes.object,
  };

  Wrapper.defaultProps = {
    onClick: null,
    type: PORTABILITY,
    children: null,
    redirectProps: {},
  };

  return Wrapper;
};

export default withRequestCreation;
