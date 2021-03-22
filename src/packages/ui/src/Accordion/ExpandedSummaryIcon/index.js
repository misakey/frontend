import React, { useState, useCallback, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';

import isFunction from '@misakey/helpers/isFunction';

import Accordion from '@misakey/ui/Accordion';
import AccordionSummary from '@misakey/ui/AccordionSummary';

// COMPONENTS
const AccordionExpandedSummaryIcon = forwardRef(({
  onChange, defaultExpanded,
  children,
  moreIcon, lessIcon,
  summary, accordionSummaryProps,
  ...props
}, ref) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleChange = useCallback(
    (e, isExpanded) => {
      if (isFunction(onChange)) {
        onChange(e, isExpanded);
      }
      setExpanded(isExpanded);
    },
    [onChange, setExpanded],
  );

  useEffect(
    () => {
      setExpanded(defaultExpanded);
    },
    [setExpanded, defaultExpanded],
  );

  return (
    <Accordion
      ref={ref}
      expanded={expanded}
      onChange={handleChange}
      {...props}
    >
      <AccordionSummary expandIcon={expanded ? lessIcon : moreIcon} {...accordionSummaryProps}>
        {summary}
      </AccordionSummary>
      {children}
    </Accordion>
  );
});

AccordionExpandedSummaryIcon.propTypes = {
  onChange: PropTypes.func,
  defaultExpanded: PropTypes.bool,
  children: PropTypes.node,
  moreIcon: PropTypes.node,
  lessIcon: PropTypes.node,
  summary: PropTypes.node,
  accordionSummaryProps: PropTypes.object,
};

AccordionExpandedSummaryIcon.defaultProps = {
  onChange: null,
  defaultExpanded: false,
  children: null,
  moreIcon: null,
  lessIcon: null,
  summary: null,
  accordionSummaryProps: {},
};

export default AccordionExpandedSummaryIcon;
