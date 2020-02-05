import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';


import Card from 'components/dumb/Card';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 2),
    alignItems: 'center',
    flexWrap: 'wrap',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'space-between',
      width: '100%',
    },
  },
}));

const CardSimple = ({ children, button, className, ...rest }) => {
  const classes = useStyles();

  return (
    <Card className={clsx(className, classes.root)} {...rest}>
      <div>
        {children}
      </div>
      <div className={classes.buttonGroup}>
        {button}
      </div>
    </Card>
  );
};

CardSimple.propTypes = {
  children: PropTypes.node.isRequired,
  button: PropTypes.node,
  className: PropTypes.string,
};

CardSimple.defaultProps = {
  button: null,
  className: '',
};

export default CardSimple;
