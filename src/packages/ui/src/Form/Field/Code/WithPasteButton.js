import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';
import makeStyles from '@material-ui/core/styles/makeStyles';

import FieldCode from '@misakey/ui/Form/Field/Code';
import withPaste from '@misakey/ui/Button/Paste/with';
import Box from '@material-ui/core/Box';

// CONSTANTS
const BUTTON_SMALL = 30;
const BUTTON = 48;

// HOOKS
const useStyles = makeStyles((theme) => ({
  fieldCodeRoot: ({ fullWidth }) => (fullWidth ? {
    marginRight: -BUTTON,
    [theme.breakpoints.only('xs')]: {
      marginRight: -BUTTON_SMALL,
    },
  } : {}),
}));

// COMPONENTS
const FieldCodePaste = withPaste(FieldCode);

const FieldCodeWithPasteButton = ({ fullWidth, ...props }) => {
  const classes = useStyles({ fullWidth });
  const isXs = useXsMediaQuery();

  const buttonProps = useMemo(
    () => (isXs ? { size: 'small' } : {}),
    [isXs],
  );

  return (
    <Box display="flex" flexDirection="row" alignItems="center" flexWrap="wrap">
      <FieldCodePaste
        {...props}
        fullWidth={fullWidth}
        buttonProps={buttonProps}
        classes={{ root: classes.fieldCodeRoot }}
      />
    </Box>
  );
};

FieldCodeWithPasteButton.propTypes = {
  fullWidth: PropTypes.bool,
};

FieldCodeWithPasteButton.defaultProps = {
  fullWidth: false,
};

export default FieldCodeWithPasteButton;
