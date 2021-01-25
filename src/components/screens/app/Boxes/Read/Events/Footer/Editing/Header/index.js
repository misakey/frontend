import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';

// COMPONENTS
const FooterEditingHeader = ({ onClose, value, t, ...props }) => (
  <Box {...omitTranslationProps(props)}>
    <Box display="flex" flexGrow="1" justifyContent="space-between" alignItems="center">
      <Typography color="primary">
        {t('boxes:read.actions.edit')}
      </Typography>
      <IconButton
        onClick={onClose}
        aria-label={t('common:cancel')}
      >
        <CloseIcon />
      </IconButton>
    </Box>
    <Typography noWrap>
      {value}
    </Typography>
  </Box>
);

FooterEditingHeader.propTypes = {
  onClose: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation(['boxes', 'common'])(FooterEditingHeader);
