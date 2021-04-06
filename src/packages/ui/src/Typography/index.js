import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import withStyles from '@material-ui/core/styles/withStyles';
import MuiTypography from '@material-ui/core/Typography';

// HELPERS
const isBackground = (color) => color === 'background';

// COMPONENTS
const Typography = withStyles((theme) => ({
  root: ({ color }) => {
    if (isBackground(color)) {
      return {
        color: theme.palette.background.paper,
      };
    }
    return {};
  },
}))(({ color, ...rest }) => {
  const cleanColor = useMemo(
    () => (isBackground(color) ? undefined : color),
    [color],
  );
  return <MuiTypography {...rest} color={cleanColor} />;
});

Typography.propTypes = {
  color: PropTypes.string,
};

Typography.defaultProps = {
  color: 'initial',
};

export default Typography;
