import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTranslation, Trans } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import MUILink from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core';

import routes from 'routes';

const useStyles = makeStyles((theme) => ({
  moreTypography: { marginTop: theme.spacing(2) },
}));

const SignUpFormCardContent = ({ fields }) => (
  <div className="SignUpFormCardContent">
    {fields}
    <Typography className={useStyles().moreTypography}>
      <Trans i18nKey="auth:signUp.card.more.text">
        {'En savoir plus sur '}
        <MUILink
          color="secondary"
          to={routes.legals.privacy}
          component={Link}
          target="_blank"
          rel="noopener noreferrer"
        >
          la sécurisation de mes connexions par Misakey
        </MUILink>
      </Trans>
    </Typography>
  </div>
);

SignUpFormCardContent.propTypes = {
  fields: PropTypes.node,
};

SignUpFormCardContent.defaultProps = {
  fields: null,
};

export default withTranslation('auth')(SignUpFormCardContent);
