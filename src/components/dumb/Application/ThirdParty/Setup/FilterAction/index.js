import React from 'react';
import PropTypes from 'prop-types';
import isFunction from '@misakey/helpers/isFunction';
import isNil from '@misakey/helpers/isNil';

import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import Button from 'components/dumb/Button';

const useStyles = makeStyles(() => ({
  button: {
    textTransform: 'none',
    margin: '1rem',
  },
}));

function FilterAction({ description, buttonProps: { text, action } }) {
  const classes = useStyles();

  return (
    <Box p={1} display="flex" flexDirection="column" justifyContent="center" textAlign="center" alignItems="center">
      {!isNil(description) && (
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      )}
      {isFunction(action) && !isNil(text) && (
        <Button
          className={classes.button}
          size="small"
          variant="outlined"
          color="secondary"
          text={text}
          onClick={action}
        />
      )}
    </Box>
  );
}

FilterAction.propTypes = {
  description: PropTypes.node,
  buttonProps: PropTypes.shape({
    text: PropTypes.node,
    action: PropTypes.func,
  }),
};

FilterAction.defaultProps = {
  description: null,
  buttonProps: {},
};

export default FilterAction;
