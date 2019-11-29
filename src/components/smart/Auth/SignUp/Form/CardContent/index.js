import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import MUILink from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core';

import routes from 'routes';

const useStyles = makeStyles((theme) => ({
  moreTypography: { marginTop: theme.spacing(2) },
}));

const SignUpFormCardContent = ({ t, fields }) => (
  <div className="SignUpFormCardContent">
    {fields}
    <Typography className={useStyles().moreTypography}>
      {t('auth:signUp.card.more.text')}
      <MUILink
        color="secondary"
        to={routes.legals.privacy}
        component={Link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('auth:signUp.card.more.link')}
      </MUILink>
    </Typography>
  </div>
);

SignUpFormCardContent.propTypes = {
  t: PropTypes.func.isRequired,
  fields: PropTypes.node,
};

SignUpFormCardContent.defaultProps = {
  fields: null,
};

export default withTranslation('auth')(SignUpFormCardContent);
