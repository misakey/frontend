import React, { forwardRef } from 'react';

const ComponentProxy = (Component) => forwardRef(
  (props, ref) => <Component ref={ref} {...props} />,
);

export default ComponentProxy;
