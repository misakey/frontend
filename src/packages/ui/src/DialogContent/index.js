import React from 'react';
import PropTypes from 'prop-types';

import MuiDialogContent from '@material-ui/core/DialogContent';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

// COMPONENTS
const DialogContent = ({ classes, children, title, subtitle, contentProps, ...props }) => (
  <MuiDialogContent className={classes.root} {...props}>
    <Container className={classes.container} maxWidth="sm">
      {title}
      {subtitle}
      <Box
        className={classes.content}
        display="flex"
        alignItems="flex-start"
        justifyContent="center"
        flexDirection="column"
        {...contentProps}
      >
        {children}
      </Box>
    </Container>
  </MuiDialogContent>
);

DialogContent.propTypes = {
  classes: PropTypes.shape({
    root: PropTypes.string,
    container: PropTypes.string,
    content: PropTypes.string,
  }),
  contentProps: PropTypes.object,
  children: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
};

DialogContent.defaultProps = {
  classes: {
    root: '',
    container: '',
    content: '',
  },
  contentProps: {},
  children: null,
  title: null,
  subtitle: null,
};

export default DialogContent;
