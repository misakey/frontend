import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import 'components/dumb/Screen/Screen.scss';

function Screen({ children, className, ...rest }) {
  return (
    <div className={clsx('Screen', 'flex', className)} {...rest}>
      {children}
    </div>
  );
}

Screen.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.node, PropTypes.element]).isRequired,
  className: PropTypes.string,
};

Screen.defaultProps = {
  className: '',
};

export default Screen;
