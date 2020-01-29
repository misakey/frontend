import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import getBackgroundAndColorFromString from '@misakey/helpers/getBackgroundAndColorFromString';

// CONSTANTS
const EMPTY_OBJECT = {};

// HOOKS
const useColorizedTextWhenNoImage = (image, text) => useMemo(
  () => (image ? EMPTY_OBJECT : getBackgroundAndColorFromString(text)),
  [image, text],
);

/**
 * Colorized Avatar is a circular avatar that will display image if set and
 * first letter of text (name / email) if not set.
 * If displaying text, will generate a color from a hash of the text.
 */
const ColorizedAvatar = ({ text, image, ...rest }) => {
  const { backgroundColor, isTextLight } = useColorizedTextWhenNoImage(image, text);
  const displayText = useMemo(() => text.charAt(0).toUpperCase(), [text]);

  if (image) {
    return <Avatar src={image} {...rest} />;
  }

  return (
    <Avatar
      style={{
        backgroundColor: `#${backgroundColor}`,
        color: (isTextLight) ? 'white' : 'black',
      }}
      {...rest}
    >
      {displayText}
    </Avatar>
  );
};

ColorizedAvatar.propTypes = {
  /** The image to use as avatar. If not present, will use first letter of text */
  image: PropTypes.string,
  /** The text to derivate the color from, and to extract the first letter. */
  text: PropTypes.string.isRequired,
};

ColorizedAvatar.defaultProps = {
  image: '',
};

export default ColorizedAvatar;
