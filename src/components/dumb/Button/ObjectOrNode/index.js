import React, { isValidElement } from 'react';
import PropTypes from 'prop-types';

import isObject from '@misakey/helpers/isObject';

import Button from 'components/dumb/Button';

const ButtonFromObjectOrNode = ({ button }) => {
  if (isValidElement(button)) {
    return button;
  }
  if (isObject(button)) {
    return <Button {...button} />;
  }
  return null;
};

ButtonFromObjectOrNode.propTypes = {
  button: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
};

ButtonFromObjectOrNode.defaultProps = {
  button: null,
};

export default ButtonFromObjectOrNode;
