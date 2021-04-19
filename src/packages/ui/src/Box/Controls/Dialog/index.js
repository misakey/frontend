import React from 'react';

import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import BoxControlsCard from '@misakey/ui/Box/Controls/Card';
import BoxControls from '@misakey/ui/Box/Controls';

const BoxControlsDialog = (props) => {
  const isDialogFullScreen = useDialogFullScreen();

  if (isDialogFullScreen) {
    return <BoxControlsCard {...props} />;
  }
  return <BoxControls {...props} />;
};

export default BoxControlsDialog;
