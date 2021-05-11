import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import getBackgroundAndColorFromString from '@misakey/core/helpers/getBackgroundAndColorFromString';
import isEmpty from '@misakey/core/helpers/isEmpty';

import makeColorizedStyles from '@misakey/ui/makeColorizedStyles';
import useTheme from '@material-ui/core/styles/useTheme';

import Avatar from '@misakey/ui/Avatar';

// CONSTANTS
export const BACKGROUND_COLOR = 'backgroundColor';
export const BORDER_COLOR = 'borderColor';
const COLORIZED_PROPS = [BACKGROUND_COLOR, BORDER_COLOR];

// HOOKS
const useStyles = makeColorizedStyles(() => ({
  colorDefault: {
    border: '2px solid transparent',
    boxSizing: 'border-box',
  },
}));

// COMPONENTS
/**
 * Colorized Avatar is a circular avatar that will display image if set and
 * first letter of text (name / email) if not set.
 * If displaying text, will generate a color from a hash of the text.
 */
const AvatarColorized = forwardRef(({
  text, image, children,
  colorizedProp,
  classes: { root, colorDefault, ...classesRest },
  textLength, ...rest
}, ref) => {
  const theme = useTheme();
  const { backgroundColor } = useMemo(
    () => getBackgroundAndColorFromString(text, theme.palette.background.paper),
    [text, theme.palette.background.paper],
  );

  const displayText = useMemo(
    () => (isEmpty(text)
      ? ''
      : text.slice(0, textLength).toUpperCase()),
    [text, textLength],
  );

  const stylesProps = useMemo(
    () => ({
      [colorizedProp]: backgroundColor,
    }),
    [colorizedProp, backgroundColor],
  );

  const internalClasses = useStyles(stylesProps);

  if (image) {
    return (
      <Avatar
        ref={ref}
        classes={{
          root: clsx(internalClasses.colorized, root),
          colorDefault: clsx(internalClasses.colorDefault, colorDefault),
          ...classesRest,
        }}
        src={image}
        alt={text}
        {...rest}
      >
        {children}
      </Avatar>
    );
  }

  return (
    <Avatar
      ref={ref}
      classes={{
        root: clsx(internalClasses.colorized, root),
        colorDefault: clsx(internalClasses.colorDefault, colorDefault),
        ...classesRest,
      }}
      alt={text}
      {...rest}
    >
      {children || displayText}
    </Avatar>
  );
});

AvatarColorized.propTypes = {
  /** The image to use as avatar. If not present, will use first letter of text */
  image: PropTypes.string,
  /** Children in case we want to override displayed text */
  children: PropTypes.node,
  /** The text to derivate the color from, and to extract the first letter. */
  text: PropTypes.string.isRequired,
  textLength: PropTypes.number,
  colorizedProp: PropTypes.oneOf(COLORIZED_PROPS),
  classes: PropTypes.shape({
    root: PropTypes.string,
    colorDefault: PropTypes.string,
  }),
};

AvatarColorized.defaultProps = {
  image: '',
  children: null,
  textLength: 1,
  colorizedProp: BORDER_COLOR,
  classes: {},
};

export default AvatarColorized;
