import clsx from 'clsx';
import PropTypes from 'prop-types';

import { ACCORDION_MIN_HEIGHT } from '@misakey/ui/constants/sizes';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { useMemo } from 'react';

import MuiAccordionSummary from '@material-ui/core/AccordionSummary';

// HOOKS
const useStyles = makeStyles(() => ({
  accordionSummaryRoot: {
    '&.Mui-expanded': {
      minHeight: ACCORDION_MIN_HEIGHT,
    },
  },
}));

// COMPONENTS
const AccordionSummary = ({ classes, ...props }) => {
  const innerClasses = useStyles();

  const mergedClasses = useMemo(
    () => {
      const { root, ...rest } = classes;
      return {
        root: clsx(innerClasses.accordionSummaryRoot, root),
        ...rest,
      };
    },
    [classes, innerClasses],
  );

  return (
    <MuiAccordionSummary
      classes={mergedClasses}
      {...props}
    />
  );
};

AccordionSummary.propTypes = {
  classes: PropTypes.shape({
    root: PropTypes.string,
  }),
};

AccordionSummary.defaultProps = {
  classes: {},
};

export default AccordionSummary;
