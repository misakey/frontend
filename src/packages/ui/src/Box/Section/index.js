import PropTypes from 'prop-types';
import clsx from 'clsx';

import withStyles from '@material-ui/core/styles/withStyles';
import Box from '@material-ui/core/Box';

const BoxSection = withStyles((theme) => ({
  root: {
    border: `1px solid ${theme.palette.grey.A100}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
}))(({ children, className, classes, ...rest }) => (
  <Box component="section" p={3} className={clsx(classes.root, className)} {...rest}>
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
