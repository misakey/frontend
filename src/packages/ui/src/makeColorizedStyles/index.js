import makeStyles from '@material-ui/core/styles/makeStyles';
import alwaysEmptyObject from '@misakey/core/helpers/always/emptyObject';

// HOOKS
export default (styles = alwaysEmptyObject) => makeStyles((theme) => ({
  colorized: ({ backgroundColor = theme.palette.background.default, borderColor = 'transparent' }) => ({
    borderColor,
    backgroundColor,
    // @FIXME: getContrastText? make use of isTextLight?
    color: theme.palette.getContrastText(backgroundColor),
  }),
  ...styles(theme),
}));
