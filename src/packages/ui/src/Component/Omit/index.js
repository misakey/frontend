import React from 'react';
import omit from '@misakey/helpers/omit';

// COMPONENTS
const ComponentOmit = (Component, toOmit) => (props) => <Component {...omit(props, toOmit)} />;

export default ComponentOmit;
