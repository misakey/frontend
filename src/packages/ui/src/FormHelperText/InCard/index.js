import makeStyles from '@material-ui/core/styles/makeStyles';

import FormHelperText from '@material-ui/core/FormHelperText';

// CONSTANTS
// margins from https://github.com/mui-org/material-ui/blob/master/packages/material-ui/src/FormHelperText/FormHelperText.js
const MARGIN_TOP = 3;
const DENSE_MARGIN_TOP = 4;

// HOOKS
// set negative margins so that FormHelperText overflows outside of parent
const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: `calc(-${theme.typography.caption.fontSize} * ${theme.typography.caption.lineHeight} - ${MARGIN_TOP}px)`,
  },
  marginDense: {
    marginBottom: `calc(-${theme.typography.caption.fontSize} * ${theme.typography.caption.lineHeight} - ${DENSE_MARGIN_TOP}px)`,
  },
}));

// COMPONENTS
const FormHelperTextInCard = (props) => {
  const classes = useStyles();

  return (
    <FormHelperText
      classes={{ root: classes.root, marginDense: classes.marginDense }}
      {...props}
    />
  );
};

export default FormHelperTextInCard;
