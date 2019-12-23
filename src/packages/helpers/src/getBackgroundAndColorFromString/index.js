import stringToRGB from '../stringToRGB';

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

export default (str) => {
  const backgroundColor = stringToRGB(str);
  const isTextLight = shouldTextBeWhite(backgroundColor);
  return { backgroundColor, isTextLight };
};
