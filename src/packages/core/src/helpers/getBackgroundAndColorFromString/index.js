import stringToRGB from '@misakey/core/helpers/stringToRGB';
import isEmpty from '@misakey/core/helpers/isEmpty';

function derivateFromColor(c) {
  let derivated = c / 255.0;
  if (derivated <= 0.03928) {
    derivated /= 12.92;
  } else {
    derivated = ((derivated + 0.055) / 1.055) ** 2.4;
  }
  return derivated;
}

function luminanceFromRGB({ r, g, b }) {
  return (
    0.2126 * derivateFromColor(r)
    + 0.7152 * derivateFromColor(g)
    + 0.0722 * derivateFromColor(b)
  );
}

function shouldTextBeWhite(rgb) {
  const luminance = luminanceFromRGB(rgb);
  return luminance <= 0.179;
}

// Source: https://stackoverflow.com/a/3943023/12688757
export default (str, fallback = '000') => {
  const backgroundColor = isEmpty(str) ? fallback : `#${stringToRGB(str)}`;
  // @UNUSED, material-ui gives `theme.palette.getContrastText`
  const isTextLight = shouldTextBeWhite(backgroundColor);
  return { backgroundColor, isTextLight };
};
