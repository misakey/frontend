import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import withStyles from '@material-ui/core/styles/withStyles';

import MuiTabs from '@material-ui/core/Tabs';

// HELPERS
const isBackground = (color) => color === 'background';

// COMPONENTS
let Tabs = ({ indicatorColor, textColor, ...props }, ref) => {
  const cleanIndicatorColor = useMemo(
    () => (isBackground(indicatorColor) ? undefined : indicatorColor),
    [indicatorColor],
  );

  const cleanTextColor = useMemo(
    () => (isBackground(textColor) ? undefined : textColor),
    [textColor],
  );

  return (
    <MuiTabs
      ref={ref}
      indicatorColor={cleanIndicatorColor}
      textColor={cleanTextColor}
      {...props}
    />
  );
};

Tabs = forwardRef(Tabs);

Tabs.propTypes = {
  indicatorColor: PropTypes.string,
  textColor: PropTypes.string,
  classes: PropTypes.shape({
    root: PropTypes.string,
  }),
};

Tabs.defaultProps = {
  indicatorColor: 'secondary',
  textColor: 'inherit',
  classes: {},
};

export default withStyles((theme) => ({
  indicator: ({ indicatorColor }) => ({
    minHeight: 'auto',
    backgroundColor: isBackground(indicatorColor) ? theme.palette.background.paper : undefined,
  }),
  root: ({ textColor }) => (isBackground(textColor) ? {
    '& .MuiTab-root': {
      color: theme.palette.background.paper,
    },
  } : {}),
}))(Tabs);
