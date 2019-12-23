import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';

function ApplicationChip({ clientName, logoUri, ...rest }) {
  return (
    <Chip
      component="span"
      avatar={<Avatar component="span" alt={clientName} src={logoUri} />}
      label={clientName}
      variant="outlined"
      {...rest}
    />
  );
}

ApplicationChip.propTypes = {
  clientName: PropTypes.string,
  logoUri: PropTypes.string,
};

ApplicationChip.defaultProps = {
  clientName: '',
  logoUri: '',
};

export default ApplicationChip;
