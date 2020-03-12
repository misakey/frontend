import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import MUILink from '@material-ui/core/Link';

import routes from 'routes';

const AuthForgotSubtitle = ({ name, t, email }) => (
  <>
    {t(`auth:forgotPassword.subtitle.${name}`, { email })}
    <MUILink
      to={routes._}
      component={Link}
      target="_blank"
      rel="noopener noreferrer"
      underline="none"
      className="misakey-brand"
    >
      {t('auth:forgotPassword.link')}
    </MUILink>
  </>
);

AuthForgotSubtitle.propTypes = {
  name: PropTypes.oneOf(['confirm', 'resetPassword']).isRequired,
  t: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
};

export default withTranslation('auth')(AuthForgotSubtitle);
