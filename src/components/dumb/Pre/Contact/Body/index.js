import React from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

// HOOKS
const useStyles = makeStyles((theme) => ({
  body: {
    margin: 0,
    overflow: 'auto',
    lineHeight: theme.typography.body1.lineHeight,
    whiteSpace: 'pre-wrap',
  },
}));

// COMPONENTS
const PreContactBody = ({ children }) => {
  const classes = useStyles();

  return (
    <pre className={classes.body}>
      {children}
    </pre>
  );
};

PreContactBody.propTypes = {
  children: PropTypes.node,
};

PreContactBody.defaultProps = {
  children: null,
};

export default PreContactBody;
