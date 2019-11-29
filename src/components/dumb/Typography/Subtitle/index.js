import React from 'react';
import Typography from '@material-ui/core/Typography';

const Subtitle = (props) => <Typography {...props} />;

Subtitle.defaultProps = {
  component: 'h3',
  variant: 'body2',
  color: 'textSecondary',
  gutterBottom: true,
};

export default Subtitle;
