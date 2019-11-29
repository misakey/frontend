import React from 'react';
import ShowIf from 'components/dumb/Visibility/ShowIf';

function HideIf(props) {
  return <ShowIf not {...props} />;
}

HideIf.propTypes = ShowIf.propTypes;

export default HideIf;
