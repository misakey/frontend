import React, { useMemo } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';


import MuiAccordion from '@material-ui/core/Accordion';

// HOOKS
const useStyles = makeStyles(() => ({
  accordionRoot: {
    '&.Mui-expanded': {
      margin: 0,
    },
  },
}));

// COMPONENTS
const Accordion = ({ classes, ...props }) => {
  const innerClasses = useStyles();

  const mergedClasses = useMemo(
    () => {
      const { root, ...rest } = classes;
      return {
        root: clsx(innerClasses.accordionRoot, root),
        ...rest,
      };
    },
    [classes, innerClasses],
  );

  return (
    <MuiAccordion
      classes={mergedClasses}
      {...props}
    />
  );
};

Accordion.propTypes = {
  classes: PropTypes.shape({
    root: PropTypes.string,
  }),
};

Accordion.defaultProps = {
  classes: {},
};

export default Accordion;
