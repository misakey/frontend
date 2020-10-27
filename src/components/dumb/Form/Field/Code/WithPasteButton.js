import React, { useMemo } from 'react';

import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';

import FieldCode from 'components/dumb/Form/Field/Code';
import withPaste from '@misakey/ui/Button/Paste/with';
import Box from '@material-ui/core/Box';

// COMPONENTS
const FieldCodePaste = withPaste(FieldCode);

const FieldCodeWithPasteButton = (props) => {
  const isXs = useXsMediaQuery();

  const buttonProps = useMemo(
    () => (isXs ? { size: 'small' } : {}),
    [isXs],
  );

  return (
    <Box display="flex" flexDirection="row" alignItems="center" flexWrap="wrap">
      <FieldCodePaste {...props} buttonProps={buttonProps} />
    </Box>
  );
};

export default FieldCodeWithPasteButton;
