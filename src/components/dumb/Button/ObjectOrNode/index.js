import React, { isValidElement } from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';
import isObject from '@misakey/helpers/isObject';

import Button from 'components/dumb/Button';

const ButtonFromObjectOrNode = ({ button }) => {
  if (isValidElement(button) || isNil(button)) {
    return button;
  }
  if (isObject(button)) {
    return <Button {...button} />;
  }
  return null;
};

ButtonFromObjectOrNode.propTypes = {
  button: PropTypes.oneOfType([PropTypes.object, PropTypes.node]).isRequired,
};

export default ButtonFromObjectOrNode;
