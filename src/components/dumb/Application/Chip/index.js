import React from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';

function ApplicationChip({ clientName, logoUri, t, ...rest }) {
  return (
    <Chip
      component="span"
      avatar={<Avatar component="span" alt={t('screens:application.chipAvatar.alt', { clientName })} src={logoUri} />}
      label={clientName}
      variant="outlined"
      {...rest}
    />
  );
}

ApplicationChip.propTypes = {
  clientName: PropTypes.string,
  logoUri: PropTypes.string,
  t: PropTypes.func.isRequired,
};

ApplicationChip.defaultProps = {
  clientName: '',
  logoUri: '',
};

export default withTranslation(['screens'])(ApplicationChip);
