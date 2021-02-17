import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import getBackgroundAndColorFromString from '@misakey/helpers/getBackgroundAndColorFromString';
import isEmpty from '@misakey/helpers/isEmpty';

import { makeStyles } from '@material-ui/core/styles';
import useTheme from '@material-ui/core/styles/useTheme';

import Avatar from '@misakey/ui/Avatar';

// CONSTANTS
export const BACKGROUND_COLOR = 'backgroundColor';
export const BORDER_COLOR = 'borderColor';
const COLORIZED_PROPS = [BACKGROUND_COLOR, BORDER_COLOR];

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatarColorized: ({ backgroundColor = theme.palette.background.default, borderColor = 'transparent' }) => ({
    border: `2px solid ${borderColor}`,
    backgroundColor,
    // @FIXME: getContrastText? make use of isTextLight?
    color: theme.palette.getContrastText(backgroundColor),
    boxSizing: 'border-box',
  }),
}));


// COMPONENTS
/**
 * Colorized Avatar is a circular avatar that will display image if set and
 * first letter of text (name / email) if not set.
 * If displaying text, will generate a color from a hash of the text.
 */
const AvatarColorized = ({ text, image, colorizedProp, classes, textLength, ...rest }) => {
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
        classes={{ colorDefault: internalClasses.avatarColorized, ...classes }}
        src={image}
        alt={text}
        {...rest}
      />
    );
  }

  return (
    <Avatar
      classes={{ colorDefault: internalClasses.avatarColorized, ...classes }}
      alt={text}
      {...rest}
    >
      {displayText}
    </Avatar>
  );
};

AvatarColorized.propTypes = {
  /** The image to use as avatar. If not present, will use first letter of text */
  image: PropTypes.string,
  /** The text to derivate the color from, and to extract the first letter. */
  text: PropTypes.string.isRequired,
  textLength: PropTypes.number,
  colorizedProp: PropTypes.oneOf(COLORIZED_PROPS),
  classes: PropTypes.object,
};

AvatarColorized.defaultProps = {
  image: '',
  textLength: 1,
  colorizedProp: BORDER_COLOR,
  classes: {},
};

export default AvatarColorized;
