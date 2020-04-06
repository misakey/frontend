import { useCallback } from 'react';

import isNil from '@misakey/helpers/isNil';
import prop from '@misakey/helpers/prop';

export default (type) => useCallback((themeOptions) => {
  const newSecondary = prop(type)(themeOptions.palette);

  // if type is unknown, we keep the usual secondary color
  if (!isNil(newSecondary)) {
    return {
      ...themeOptions,
      palette: {
        ...themeOptions.palette,
        secondary: {
          ...themeOptions.palette.secondary,
          ...newSecondary,
        },
      },
    };
  }

  return themeOptions;
}, [type]);
