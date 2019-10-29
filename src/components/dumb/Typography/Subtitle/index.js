import React from 'react';
import Typography from '@material-ui/core/Typography';

const TypographySubtitle = (props) => <Typography {...props} />;

TypographySubtitle.defaultProps = {
  variant: 'body2',
  color: 'textSecondary',
  gutterBottom: true,
};

// @FIXME add to js-common
export default TypographySubtitle;
