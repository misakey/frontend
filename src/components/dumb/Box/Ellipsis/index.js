import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';

// HOOKS
const useStyles = makeStyles(() => ({
  root: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

// COMPONENTS
const BoxEllipsis = (props) => {
  const classes = useStyles();

  return <Box classes={{ root: classes.root }} {...props} />;
};

export default BoxEllipsis;
