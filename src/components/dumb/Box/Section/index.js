import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import withStyles from '@material-ui/core/styles/withStyles';
import Box from '@material-ui/core/Box';

/**
 * @FIXME add to @misakey/ui
 */
const BoxSection = withStyles(theme => ({
  root: {
    border: '1px solid #dadce0',
    borderRadius: 8,
    overflow: 'hidden',
    padding: theme.spacing(3),
  },
}))(({ children, className, classes, ...rest }) => (
  <Box component="section" className={clsx(classes.root, className)} {...rest}>
    {children}
  </Box>
));

BoxSection.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

BoxSection.defaultProps = {
  children: null,
  className: '',
};

export default BoxSection;
