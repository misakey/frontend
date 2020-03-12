import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTranslation, Trans } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import MUILink from '@material-ui/core/Link';
import ChipUser from 'components/dumb/Chip/User';
import { STEP } from 'components/screens/Auth/SignIn/Form/constants';

import routes from 'routes';

const useStyles = makeStyles((theme) => ({
  moreTypography: { marginTop: theme.spacing(2) },
  chipContainer: { textAlign: 'center' },
}));

const UserPublicChip = ({ userPublicData, onDelete, className }) => (
  <div className={className}>
    <ChipUser
      onClick={onDelete}
      onDelete={onDelete}
      {...userPublicData}
    />
  </div>
);

UserPublicChip.propTypes = {
  className: PropTypes.string,
  onDelete: PropTypes.func.isRequired,
  userPublicData: PropTypes.shape({
    displayName: PropTypes.string,
    identifier: PropTypes.string.isRequired,
    avatarUri: PropTypes.string,
  }).isRequired,
};

UserPublicChip.defaultProps = {
  className: '',
};

const SignInFormCard = ({ actions, fields, handlePrevious, step, userPublicData, values }) => {
  const classes = useStyles();
  const displayChip = step === STEP.secret;

  return (
    <div className="SignInFormCardContent">
      {displayChip && (
        <UserPublicChip
          onDelete={handlePrevious}
          userPublicData={{ ...userPublicData, identifier: values.identifier }}
          className={classes.chipContainer}
        />
      )}
      {fields}
      {actions}
      <Typography className={classes.moreTypography}>
        <Trans i18nKey="auth:signIn.card.more">
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
};

SignInFormCard.propTypes = {
  fields: PropTypes.node,
  actions: PropTypes.node,
  handlePrevious: PropTypes.func.isRequired,
  step: PropTypes.oneOf([STEP.identifier, STEP.secret]).isRequired,
  userPublicData: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUri: PropTypes.string,
  }).isRequired,
  values: PropTypes.shape({ identifier: PropTypes.string.isRequired }).isRequired,
};

SignInFormCard.defaultProps = {
  actions: null,
  fields: null,
};

export default withTranslation(['auth'])(SignInFormCard);
