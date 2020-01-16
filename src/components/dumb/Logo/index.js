import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const Logo = ({ short, component: Component, ...rest }) => {
  const src = useMemo(
    () => (short
      ? '/ico/favicon-48x48.png'
      : '/img/misakey-rose.svg'),
    [short],
  );

  return (
    <Component src={src} {...rest} alt="Misakey" />
  );
};

Logo.propTypes = {
  short: PropTypes.bool,
  component: PropTypes.elementType,
};

Logo.defaultProps = {
  short: false,
  component: 'img',
};

export default Logo;
