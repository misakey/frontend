import TextField from '@misakey/ui/TextField';
import makeStyles from '@material-ui/core/styles/makeStyles';

// HOOKS
const useStyles = makeStyles(() => ({
  inputLabelRoot: {
    width: '100%',
    textAlign: 'center',
    transformOrigin: 'top center',
  },
  formControl: {
    fontSize: '1.2rem',
  },
  inputLabelShrink: { transformOrigin: 'top center' },
  input: {
    textAlign: 'center',
  },
}));

// COMPONENTS
const TextFieldStandard = (props) => {
  const classes = useStyles();

  return (
    <TextField
      type="text"
      variant="standard"
      InputLabelProps={{
        classes: {
          root: classes.inputLabelRoot,
          shrink: classes.inputLabelShrink,
          formControl: classes.formControl,
        },
      }}
      InputProps={{ classes: { root: classes.input } }}
      {...props}
    />
  );
};

export default TextFieldStandard;
