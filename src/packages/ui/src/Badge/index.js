import makeStyles from '@material-ui/core/styles/makeStyles';

import MuiBadge from '@material-ui/core/Badge';

// HOOKS
const useStyles = makeStyles((theme) => ({
  badge: {
    right: 3,
    top: 15,
    border: `2px solid ${theme.palette.background.default}`,
    padding: '0 4px',
  },
}));

// COMPONENTS
const Badge = (props) => {
  const classes = useStyles();

  return (
    <MuiBadge
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      classes={{ badge: classes.badge }}
      color="primary"
      {...props}
    />
  );
};

export default Badge;
