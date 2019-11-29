import React from 'react';
import Typography from '@material-ui/core/Typography';

const Title = (props) => <Typography {...props} />;

Title.defaultProps = {
  component: 'h2',
  variant: 'h5',
  gutterBottom: true,
};

export default Title;
