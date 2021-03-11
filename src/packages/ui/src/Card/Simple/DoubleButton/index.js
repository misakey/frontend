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
  buttonGroup: {
    [theme.breakpoints.up('sm')]: {
      '& > *:not(:last-child)': {
        marginRight: theme.spacing(0.5),
      },
      '& > *:not(:first-child)': {
        marginLeft: theme.spacing(0.5),
      },
    },
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'space-between',
    },
  },
}));

const CardSimpleDoubleButton = ({ text, primary, secondary, ...rest }) => {
  const classes = useStyles();
  return (
    <SimpleCard
      classes={{ buttonGroup: classes.buttonGroup }}
      button={(
        <>
          <ButtonFromObjectOrNode button={secondary} />
          <ButtonFromObjectOrNode button={primary} />
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
