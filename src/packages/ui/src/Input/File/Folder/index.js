import { forwardRef } from 'react';

import InputFile from '@misakey/ui/Input/File';

// COMPONENTS
const InputFileFolder = forwardRef((props, ref) => (
  <InputFile
    ref={ref}
    webkitdirectory="true"
    {...props}
  />
));

export default InputFileFolder;
