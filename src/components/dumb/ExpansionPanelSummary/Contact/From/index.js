import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { MIN_CARD_HEIGHT } from '@misakey/ui/constants/sizes';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';

import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// HOOKS
const useStyles = makeStyles((theme) => ({
  expansionPanelSummaryRoot: {
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: theme.shape.borderRadius,
    minHeight: MIN_CARD_HEIGHT,
    boxSizing: 'border-box',
  },
  expansionPanelSummaryContent: {
    overflow: 'hidden',
    margin: 'auto 0',
    // fix for weird logic of expansion panel classes
    // classes.expanded doesn't work because default style uses content.Mui-expanded
    '&.Mui-expanded': {
      margin: 'auto 0',
    },
  },
  typographyFromLabelRoot: {
    marginRight: theme.spacing(1),
    whiteSpace: 'nowrap',
  },
}));

// COMPONENTS
const ExpansionPanelSummaryContactFrom = ({ email, type, t, ...rest }) => {
  const classes = useStyles();

  return (
    <ExpansionPanelSummary
      classes={{
        root: classes.expansionPanelSummaryRoot,
        content: classes.expansionPanelSummaryContent,
      }}
      expandIcon={<ExpandMoreIcon />}
      aria-controls="panel-contact-content"
      id="panel-contact-header"
      {...omitTranslationProps(rest)}
    >
      <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" flexGrow={1} overflow="hidden">
        <Box display="flex" overflow="hidden">
          <Typography classes={{ root: classes.typographyFromLabelRoot }}>
            {t('citizen:contact.email.from.label')}
          </Typography>
          <Fade in={!isNil(email)}>
            <Typography noWrap>
              {email}
            </Typography>
          </Fade>
        </Box>
        <Fade in={!isNil(type)}>
          <Typography>
            {type}
          </Typography>
        </Fade>
      </Box>
    </ExpansionPanelSummary>
  );
};

ExpansionPanelSummaryContactFrom.propTypes = {
  email: PropTypes.string,
  type: PropTypes.string,
  // withTranslation
  t: PropTypes.func.isRequired,
};

ExpansionPanelSummaryContactFrom.defaultProps = {
  email: null,
  type: null,
};

export default withTranslation('citizen')(ExpansionPanelSummaryContactFrom);
