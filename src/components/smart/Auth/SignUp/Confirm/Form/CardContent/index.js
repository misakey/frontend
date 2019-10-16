import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  moreTypography: { marginTop: theme.spacing(2) },
}));

const SignUpConfirmFormCardContent = ({ t, fields }) => (
  <div className="SignUpConfirmFormCardContent">
    {fields}
    <Typography className={useStyles().moreTypography}>
      {t('auth:signUpConfirm.card.more.text')}
    </Typography>
  </div>
);

SignUpConfirmFormCardContent.propTypes = {
  t: PropTypes.func.isRequired,
  fields: PropTypes.node,
};

SignUpConfirmFormCardContent.defaultProps = {
  fields: null,
};

export default withTranslation('auth')(SignUpConfirmFormCardContent);
