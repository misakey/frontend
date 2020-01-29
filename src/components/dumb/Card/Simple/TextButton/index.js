import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';


import Card from 'components/dumb/Card';
import ButtonFromObjectOrNode from 'components/dumb/Button/ObjectOrNode';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    alignItems: 'center',
  },
}));

const CardSimpleTextButton = ({ text, button, ...rest }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root} {...rest}>
      <Typography>
        {text}
      </Typography>
      <ButtonFromObjectOrNode button={button} />
    </Card>
  );
};

CardSimpleTextButton.propTypes = {
  text: PropTypes.string.isRequired,
  button: PropTypes.oneOfType([PropTypes.object, PropTypes.node]).isRequired,
};

export default CardSimpleTextButton;
