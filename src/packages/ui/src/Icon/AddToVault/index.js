import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Badge from '@material-ui/core/Badge';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import LibraryAddIcon from '@material-ui/icons/LibraryAdd';

// HOOKS
const useStyles = makeStyles(() => ({
  badge: {
    bottom: 2,
  },
  checkIcon: {
    fontSize: '1rem',
  },
}));

const AddToVaultIcon = forwardRef(({ isSaved, ...props }, ref) => {
  const classes = useStyles();

  return (
    <Badge
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      classes={{ badge: classes.badge }}
      badgeContent={isSaved ? <CheckCircleIcon className={classes.checkIcon} color="primary" /> : null}
    >
      <LibraryAddIcon {...props} ref={ref} />
    </Badge>
  );
});

AddToVaultIcon.propTypes = {
  isSaved: PropTypes.bool,
};

AddToVaultIcon.defaultProps = {
  isSaved: false,
};

export default AddToVaultIcon;
