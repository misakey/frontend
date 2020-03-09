import React from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import PreContactBody from 'components/dumb/Pre/Contact/Body';
import CardSimple, { X_SPACING, Y_SPACING } from 'components/dumb/Card/Simple';

// HOOKS
const useStyles = makeStyles((theme) => ({
  cardBody: {
    position: 'relative',
  },
  cardBodyButtonGroup: {
    position: 'absolute',
    top: theme.spacing(Y_SPACING + 1),
    right: theme.spacing(X_SPACING),
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'flex-end',
      width: 'auto',
    },
  },
  cardBodyContent: {
    maxWidth: '100%',
  },
}));

// COMPONENTS
const CardContactBody = ({ children, ...rest }) => {
  const classes = useStyles();

  return (
    <CardSimple
      className={classes.cardBody}
      classes={{
        content: classes.cardBodyContent,
        buttonGroup: classes.cardBodyButtonGroup,
      }}
      {...rest}
    >
      <PreContactBody>
        {children}
      </PreContactBody>
    </CardSimple>
  );
};

CardContactBody.propTypes = {
  children: PropTypes.node,
};

CardContactBody.defaultProps = {
  children: null,
};

export default CardContactBody;
