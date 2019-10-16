import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import ApplicationChip from '@misakey/ui/Application/Chip';

function AuthCardTitle({ name, sso, t }) {
  return (
    <>
      {t(`auth:${name}.card.title`)}
      <ApplicationChip clientName={sso.clientName} logoUri={sso.logoUri} />
    </>
  );
}

AuthCardTitle.propTypes = {
  name: PropTypes.oneOf(['signIn', 'signUp', 'signUpConfirm', 'recover']),
  t: PropTypes.func.isRequired,
  sso: PropTypes.shape({ clientName: PropTypes.string, logoUri: PropTypes.string }).isRequired,
};

AuthCardTitle.defaultProps = {
  name: 'signIn',
};

export default connect(
  (state) => ({ sso: state.sso }),
)(withTranslation('auth')(AuthCardTitle));
