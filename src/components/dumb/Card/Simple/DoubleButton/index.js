import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

import SimpleCard from 'components/dumb/Card/Simple';
import Typography from '@material-ui/core/Typography';
import ButtonFromObjectOrNode from 'components/dumb/Button/ObjectOrNode';


const useStyles = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(1, 0),
  },
}));

const CardSimpleDoubleButton = ({ text, primary, secondary, ...rest }) => {
  const classes = useStyles();
  return (
    <SimpleCard
      button={(
        <>
          <ButtonFromObjectOrNode button={primary} />
          <ButtonFromObjectOrNode button={secondary} />
        </>
      )}
      {...rest}
    >
      <Typography className={classes.typography}>
        {text}
      </Typography>
    </SimpleCard>
  );
};

CardSimpleDoubleButton.propTypes = {
  text: PropTypes.string.isRequired,
  primary: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
  secondary: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
};

CardSimpleDoubleButton.defaultProps = {
  primary: null,
  secondary: null,
};

export default CardSimpleDoubleButton;
