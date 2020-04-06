import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';

import ExpansionPanelSummaryContact from 'components/dumb/ExpansionPanelSummary/Contact';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';

// HOOKS
const useStyles = makeStyles((theme) => ({
  typographyFromLabelRoot: {
    marginRight: theme.spacing(1),
    whiteSpace: 'nowrap',
  },
}));

// COMPONENTS
const ExpansionPanelSummaryContactFrom = ({ email, type, t, ...rest }) => {
  const classes = useStyles();

  return (
    <ExpansionPanelSummaryContact
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
    </ExpansionPanelSummaryContact>
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
