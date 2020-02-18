import React, { useMemo } from 'react';
import Screen from 'components/dumb/Screen';

function NotFound() {
  const error = useMemo(() => {
    const e = new Error();
    e.status = 404;
    return e;
  }, []);

  return (
    <Screen state={{ error }} />
  );
}

export default NotFound;
