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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'center',
      width: '100%',
    },
  },
}));

const CardSimple = ({ classes, children, button, className, ...rest }) => {
  const internalClasses = useStyles();

  return (
    <Card className={clsx(className, internalClasses.root)} {...rest}>
      <div>
        {children}
      </div>
      <div className={clsx(internalClasses.buttonGroup, classes.buttonGroup)}>
        {button}
      </div>
    </Card>
  );
};

CardSimple.propTypes = {
  classes: PropTypes.shape({
    buttonGroup: PropTypes.string,
  }),
  children: PropTypes.node.isRequired,
  button: PropTypes.node,
  className: PropTypes.string,
};

CardSimple.defaultProps = {
  classes: {
    buttonGroup: '',
  },
  button: null,
  className: '',
};

export default CardSimple;
