import React from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';

// HOOKS
const useStyles = makeStyles((theme) => ({
  preview: {
    display: 'flex',
    flexDirection: 'column',
  },
  heading: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    margin: theme.spacing(0, 0, 1, 0),
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.primary.main}`,
    lineHeight: theme.typography.subtitle1.lineHeight,
  },
  subject: {
    fontWeight: 'bold',
  },
  mailto: {
    whiteSpace: 'normal',
  },
  body: {
    margin: 0,
    overflow: 'auto',
    lineHeight: theme.typography.body1.lineHeight,
    whiteSpace: 'pre-wrap',
  },
}));

// COMPONENTS
const PreMail = ({ mailto, subject, body }) => {
  const classes = useStyles();
  return (
    <Box my={3} className={classes.preview}>
      <pre className={classes.heading}>
        {subject && (
          <span className={classes.subject}>
            {subject}
          </span>
        )}
        {mailto && (
          <span className={classes.mailto}>
            {mailto}
          </span>
        )}
      </pre>
      {body && (
        <pre className={classes.body}>
          {body}
        </pre>
      )}
    </Box>
  );
};

PreMail.propTypes = {
  mailto: PropTypes.node,
  subject: PropTypes.node,
  body: PropTypes.node,
};

PreMail.defaultProps = {
  mailto: null,
  subject: null,
  body: null,
};

export default PreMail;
