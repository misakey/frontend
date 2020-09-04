import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import Box from '@material-ui/core/Box';
import Backdrop from '@material-ui/core/Backdrop';
import Typography from '@material-ui/core/Typography';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';

// COMPONENTS
const BackdropLoading = ({ loading, t, ...props }) => (
  <Backdrop {...omitTranslationProps(props)}>
    {loading && (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <HourglassEmptyIcon fontSize="large" color="secondary" />
        <Typography variant="h5" component="h3" color="textSecondary">
          {t('common:loading')}
        </Typography>
      </Box>
    )}
  </Backdrop>
);

BackdropLoading.propTypes = {
  loading: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

BackdropLoading.defaultProps = {
  loading: false,
};

export default withTranslation('common')(BackdropLoading);
