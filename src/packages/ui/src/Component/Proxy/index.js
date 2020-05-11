import React from 'react';

const ComponentProxy = (Component) => (props) => <Component {...props} />;

export default ComponentProxy;
