import React, { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
// import { Link } from 'react-router-dom';

import routes from 'routes';

import { screenAuthSetPublics } from 'store/actions/screens/auth';

import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import makeStyles from '@material-ui/core/styles/makeStyles';

// import MUILink from '@material-ui/core/Link';
// import Typography from '@material-ui/core/Typography';
// import Box from '@material-ui/core/Box';
import CardAuth from 'components/dumb/Card/Auth';
import CardHeaderAuthSignUp from 'components/smart/Card/Auth/Header/SignUp';
import ButtonGoBackTo from 'components/dumb/Button/GoBack/To';
import FormFields from '@misakey/ui/Form/Fields';
import FieldText from 'components/dumb/Form/Field/Text';
import InputAdornment from '@material-ui/core/InputAdornment';

import AccountCircle from '@material-ui/icons/AccountCircle';

// CONSTANTS
const FIELD = 'handle';

const DEFAULT_FIELDS = {
  [FIELD]: {
    component: FieldText,
    InputProps: {
      startAdornment: (
        <InputAdornment position="start">
          <AccountCircle />
        </InputAdornment>
      ),
    },
    inputProps: { 'data-matomo-ignore': true },
    autoFocus: true,
  },
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  cardRoot: {
    maxWidth: 500,
    [theme.breakpoints.up('sm')]: {
      minWidth: 500,
    },
  },
}));

// COMPONENTS
const AuthSignUpCreatePseudoFormFields = (fields) => (
  <FormFields fields={fields} prefix="signUp." defaultFields={DEFAULT_FIELDS} />
);

AuthSignUpCreatePseudoFormFields.defaultProps = DEFAULT_FIELDS;

const AuthSignUpCreatePseudo = ({
  t,
  setTouched,
  location: { search },
  dispatchClearPublics,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const padded = useMediaQuery(theme.breakpoints.up('sm'));

  const titleProps = useMemo(
    () => ({
      align: 'center',
      gutterBottom: true,
    }),
    [],
  );

  const subtitleProps = useMemo(
    () => ({
      align: 'center',
    }),
    [],
  );

  const primary = useMemo(
    () => ({
      type: 'submit',
      text: t('common:next'),
    }),
    [t],
  );

  const parentTo = useMemo(
    () => ({
      pathname: routes.auth.signUp.identifier,
      search,
    }),
    [search],
  );

  useEffect(
    () => {
      setTouched({ tos: true, email: true });
      dispatchClearPublics();
    },
    [dispatchClearPublics, setTouched],
  );

  return (
    <CardAuth
      className={classes.cardRoot}
      padded={padded}
      primary={primary}
      secondary={<ButtonGoBackTo to={parentTo} />}
      title={t('auth:signUp.create.handle.title')}
      titleProps={titleProps}
      subtitle={t('auth:signUp.create.handle.subtitle')}
      subtitleProps={subtitleProps}
      Header={CardHeaderAuthSignUp}
      formik
    >
      <AuthSignUpCreatePseudoFormFields />
      {/* <Box mt={2}>
        <Typography>
          {t('auth:signUp.create.handle.more.text')}
          <MUILink
            color="secondary"
            to={routes.legals.privacy}
            component={Link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('auth:signUp.create.handle.more.link')}
          </MUILink>
        </Typography>
      </Box> */}
    </CardAuth>
  );
};

AuthSignUpCreatePseudo.propTypes = {
  // ROUTER
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  // FORMIK
  setTouched: PropTypes.func.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  dispatchClearPublics: PropTypes.func.isRequired,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchClearPublics: () => dispatch(screenAuthSetPublics()),
});

export default connect(null, mapDispatchToProps)(withTranslation(['auth__signup', 'common'])(AuthSignUpCreatePseudo));
