import React from 'react';
import PropTypes from 'prop-types';

import ListItemText from '@material-ui/core/ListItemText';
import SimpleCard from '@misakey/ui/Card/Simple';
import ButtonFromObjectOrNode from '@misakey/ui/Button/ObjectOrNode';


const CardSimpleDoubleText = ({ primary, secondary, button, ...rest }) => (
  <SimpleCard button={<ButtonFromObjectOrNode button={button} />} {...rest}>
    <ListItemText
      primary={primary}
      secondary={secondary}
    />
  </SimpleCard>
);

CardSimpleDoubleText.propTypes = {
  primary: PropTypes.string.isRequired,
  secondary: PropTypes.string.isRequired,
  button: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
};

CardSimpleDoubleText.defaultProps = {
  button: null,
};

export default CardSimpleDoubleText;
