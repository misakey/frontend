import React, { forwardRef } from 'react';

import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import AvatarColorized, { BACKGROUND_COLOR } from '@misakey/ui/Avatar/Colorized';
import { SIZES, MEDIUM, LARGE } from '@misakey/ui/constants/sizes';

// CONSTANTS
const TEXT_LENGTH = 3;

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: ({ size }) => ({
    fontWeight: size === LARGE ? theme.typography.fontWeightBold : null,
  }),
}));

// COMPONENTS
const AvatarBox = forwardRef(({ src, title, size, ...rest }, ref) => {
  const internalClasses = useStyles({ size });

  return (
    <AvatarColorized
      ref={ref}
      text={title}
      textLength={TEXT_LENGTH}
      colorizedProp={BACKGROUND_COLOR}
      src={src}
      size={size}
      classes={{ root: internalClasses.root }}
      {...rest}
    />
  );
});

AvatarBox.propTypes = {
  src: PropTypes.string,
  title: PropTypes.string,
  size: PropTypes.oneOf(SIZES),
};

AvatarBox.defaultProps = {
  src: undefined,
  title: null,
  size: MEDIUM,
};

export default AvatarBox;
