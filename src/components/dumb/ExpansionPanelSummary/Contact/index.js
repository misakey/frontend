import React from 'react';
import PropTypes from 'prop-types';

import { MIN_CARD_HEIGHT } from '@misakey/ui/constants/sizes';

import makeStyles from '@material-ui/core/styles/makeStyles';

import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// HOOKS
const useStyles = makeStyles((theme) => ({
  expansionPanelSummaryRoot: {
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: theme.shape.borderRadius,
    minHeight: MIN_CARD_HEIGHT,
    boxSizing: 'border-box',
    // https://github.com/mui-org/material-ui/issues/20058#issuecomment-601777593
    '&.Mui-disabled': {
      opacity: 1,
    },
  },
  expansionPanelSummaryContent: {
    overflow: 'hidden',
  },
}));

// COMPONENTS
const ExpansionPanelSummaryContact = ({ children, disabled, ...rest }) => {
  const classes = useStyles();

  return (
    <ExpansionPanelSummary
      classes={{
        root: classes.expansionPanelSummaryRoot,
        content: classes.expansionPanelSummaryContent,
      }}
      expandIcon={disabled ? null : <ExpandMoreIcon />}
      {...rest}
    >
      {children}
    </ExpansionPanelSummary>
  );
};

ExpansionPanelSummaryContact.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  disabled: PropTypes.bool,
};

ExpansionPanelSummaryContact.defaultProps = {
  children: null,
  disabled: false,
};

export default ExpansionPanelSummaryContact;
