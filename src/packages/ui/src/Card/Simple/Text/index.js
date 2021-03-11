import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

import SimpleCard from '@misakey/ui/Card/Simple';
import Typography from '@material-ui/core/Typography';
import ButtonFromObjectOrNode from '@misakey/ui/Button/ObjectOrNode';

const useStyles = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(1, 0),
  },
}));

const CardSimpleText = ({ text, button, ...rest }) => {
  const classes = useStyles();
  return (
    <SimpleCard button={<ButtonFromObjectOrNode button={button} />} {...rest}>
      <Typography className={classes.typography}>
        {text}
      </Typography>
    </SimpleCard>
  );
};

CardSimpleText.propTypes = {
  text: PropTypes.string.isRequired,
  button: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
};

CardSimpleText.defaultProps = {
  button: null,
};

export default CardSimpleText;
