import React from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import PreContactBody from 'components/dumb/Pre/Contact/Body';

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
}));

// COMPONENTS
const PreContact = ({ mailto, subject, body }) => {
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
        <PreContactBody>{body}</PreContactBody>
      )}
    </Box>
  );
};

PreContact.propTypes = {
  mailto: PropTypes.node,
  subject: PropTypes.node,
  body: PropTypes.node,
};

PreContact.defaultProps = {
  mailto: null,
  subject: null,
  body: null,
};

export default PreContact;
