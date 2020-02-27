import React, { useMemo } from 'react';
import Screen from 'components/dumb/Screen';

const Forbidden = () => {
  const error = useMemo(() => {
    const e = new Error();
    e.status = 403;
    return e;
  }, []);

  return (
    <Screen state={{ error }} />
  );
};

export default Forbidden;
