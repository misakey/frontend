import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import Box from '@material-ui/core/Box';
import AvatarApplicationSso from 'components/dumb/Avatar/Application/Sso';

// CONSTANTS
const TYPOGRAPHY_PROPS = {
  variant: 'h6',
};

// COMPONENTS
function AuthCardTitle({ name, sso, t }) {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" flexWrap="wrap">
      <Box mr={1}>
        {t(`auth__new:${name}.card.title`)}
      </Box>
      <AvatarApplicationSso sso={sso} typographyProps={TYPOGRAPHY_PROPS} />
    </Box>
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
)(withTranslation('auth__new')(AuthCardTitle));
