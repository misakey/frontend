import PropTypes from 'prop-types';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import IconButton from '@material-ui/core/IconButton';

// COMPONENTS
const IconButtonAppBar = ({ children, ...props }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <IconButton
      // prevent appBar to grow too much on mobile view
      size={isSmall ? 'small' : 'medium'}
      {...props}
    >
      {children}
    </IconButton>
  );
};

IconButtonAppBar.propTypes = {
  children: PropTypes.node.isRequired,
};

export default IconButtonAppBar;
