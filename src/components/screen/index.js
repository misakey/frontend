import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './Screen.scss';

/**
 * @FIXME add to @misakey/ui
 * @param children
 * @param className
 * @param rest
 * @returns {*}
 * @constructor
 */
function Screen({ children, className, ...rest }) {
  return (
    <div className={classNames('Screen', className)} {...rest}>
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
