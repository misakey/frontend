import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import MUILink from '@material-ui/core/Link';
import ChipUser from 'components/dumb/Chip/User';

import routes from 'routes';

import 'components/smart/Auth/SignIn/Form/CardContent/CardContent.scss';

const useStyles = makeStyles((theme) => ({
  moreTypography: { marginTop: theme.spacing(2) },
}));

const UserPublicChip = ({ userPublicData, onDelete }) => (
  <div className="chipContainer">
    <ChipUser
      onClick={onDelete}
      onDelete={onDelete}
      {...userPublicData}
    />
  </div>
);

UserPublicChip.propTypes = {
  onDelete: PropTypes.func.isRequired,
  userPublicData: PropTypes.shape({
    displayName: PropTypes.string,
    email: PropTypes.string.isRequired,
    avatarUri: PropTypes.string,
  }).isRequired,
};

const SignInFormCard = ({ fields, handlePrevious, step, t, userPublicData, values }) => {
  const classes = useStyles();
  const displayChip = step === 'password';

  return (
    <div className="SignInFormCardContent">
      {displayChip && (
        <UserPublicChip
          onDelete={handlePrevious}
          userPublicData={{ ...userPublicData, email: values.email }}
        />
      )}
      {fields}
      <Typography className={classes.moreTypography}>
        {t('auth:signIn.card.more.text')}
        <MUILink
          color="secondary"
          to={routes.legals.privacy}
          component={Link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('auth:signIn.card.more.link')}
        </MUILink>
      </Typography>
    </div>
  );
};

SignInFormCard.propTypes = {
  fields: PropTypes.node,
  handlePrevious: PropTypes.func.isRequired,
  step: PropTypes.oneOf(['email', 'password']).isRequired,
  t: PropTypes.func.isRequired,
  userPublicData: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUri: PropTypes.string,
  }).isRequired,
  values: PropTypes.shape({ email: PropTypes.string.isRequired }).isRequired,
};

SignInFormCard.defaultProps = {
  fields: null,
};

export default withTranslation(['auth', 'common'])(SignInFormCard);
