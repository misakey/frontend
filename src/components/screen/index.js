import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import './Screen.scss';

/**
 * @param children
 * @param className
 * @param rest
 * @returns {*}
 * @constructor
 */
function Screen({ children, className, ...rest }) {
  return (
    <div className={clsx('Screen', className)} {...rest}>
      {children}
    </div>
  );
}

Screen.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Screen.defaultProps = {
  className: '',
};

export default Screen;
