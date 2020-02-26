import { useMemo } from 'react';
import { useHistory } from 'react-router-dom';


export default () => {
  const { goBack, length } = useHistory();

  const canGoBack = useMemo(
    () => length > 1,
    [length],
  );

  return { canGoBack, goBack };
};
