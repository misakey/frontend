import React from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';

const BOX_PROPS = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  my: 3,
};

const DatumSummaryCardContainer = ({ children }) => <Box {...BOX_PROPS}>{children}</Box>;

DatumSummaryCardContainer.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]).isRequired,
};

export default DatumSummaryCardContainer;
