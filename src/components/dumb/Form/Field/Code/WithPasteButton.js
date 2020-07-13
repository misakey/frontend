import React from 'react';

import FieldCode from 'components/dumb/Form/Field/Code';
import withPaste from '@misakey/ui/Button/Paste/with';
import Box from '@material-ui/core/Box';

// COMPONENTS
const FieldCodePaste = withPaste(FieldCode);

const FieldCodeWithPasteButton = (props) => (
  <Box display="flex" flexDirection="row" alignItems="center">
    <FieldCodePaste {...props} />
  </Box>
);

export default FieldCodeWithPasteButton;
