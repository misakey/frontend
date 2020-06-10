import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

export default () => {
  const theme = useTheme();
  // rule for dialog fullscreen
  return useMediaQuery(theme.breakpoints.down('sm'));
};
