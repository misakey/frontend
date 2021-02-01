import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import withStyles from '@material-ui/core/styles/withStyles';

import MuiTab from '@material-ui/core/Tab';

// CONSTANTS
const SMALL = 'small';
const MEDIUM = 'medium';
const LARGE = 'large';

const SIZES = [SMALL, MEDIUM, LARGE];

const MEDIUM_RULES = {
  minHeight: 32,
  padding: '4px 5px',
};

// COMPONENTS
let Tab = ({ size, ...props }, ref) => (
  <MuiTab ref={ref} {...props} />
);

Tab = forwardRef(Tab);

Tab.propTypes = {
  size: PropTypes.oneOf(SIZES),
};

Tab.defaultProps = {
  size: LARGE,
};

export default withStyles((theme) => ({
  root: ({ size }) => {
    if (size === MEDIUM) {
      return MEDIUM_RULES;
    }
    if (size === SMALL) {
      return {
        ...MEDIUM_RULES,
        padding: '0 5px',
        fontSize: theme.typography.pxToRem(13),
      };
    }

    return {};
  },
}))(Tab);
