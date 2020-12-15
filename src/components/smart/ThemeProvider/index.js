import { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import { selectors as devicePreferencesSelector } from 'store/reducers/devicePreferences';
import { initDarkMode } from 'store/actions/devicePreferences';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import { getThemeOptions } from '@misakey/ui/theme';

import { useSelector, useDispatch } from 'react-redux';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';


// COMPONENTS
function ThemeProvider({ children, previewColor }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const identity = useSelector(authSelectors.identity);
  const isDarkMode = useSelector(devicePreferencesSelector.getIsDarkMode);

  const dispatch = useDispatch();

  const color = useMemo(
    () => {
      if (!isEmpty(previewColor)) {
        return previewColor;
      }
      return isEmpty(identity) ? null : identity.color;
    },
    [identity, previewColor],
  );

  const theme = useMemo(
    () => createMuiTheme(getThemeOptions(isDarkMode, color)),
    [isDarkMode, color],
  );

  useEffect(
    () => {
      if (isNil(isDarkMode)) {
        dispatch(initDarkMode(prefersDarkMode));
      }
    },
    [isDarkMode, prefersDarkMode, dispatch],
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]).isRequired,
  previewColor: PropTypes.string,
};

ThemeProvider.defaultProps = {
  previewColor: null,
};

export default ThemeProvider;
