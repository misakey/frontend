import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import MUILink from '@material-ui/core/Link';

import routes from 'routes';

function AuthCardSubTitle({ name, t, email }) {
  return (
    <>
      {t(`auth:${name}.card.subtitle.text`, { email })}
      <MUILink
        to={routes._}
        component={Link}
        target="_blank"
        rel="noopener noreferrer"
        className="misakey-brand"
      >
        {t(`auth:${name}.card.subtitle.link`)}
      </MUILink>
    </>
  );
}

AuthCardSubTitle.propTypes = {
  name: PropTypes.oneOf(['signIn', 'signUp', 'signUpConfirm', 'recover']),
  t: PropTypes.func.isRequired,
  email: PropTypes.string,
};

AuthCardSubTitle.defaultProps = {
  name: 'signIn',
  email: null,
};

export default withTranslation('auth')(AuthCardSubTitle);
