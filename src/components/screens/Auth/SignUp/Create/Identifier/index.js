import React, { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import routes from 'routes';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

// import MUILink from '@material-ui/core/Link';
// import Typography from '@material-ui/core/Typography';
// import Box from '@material-ui/core/Box';
import Card from 'components/dumb/Card';
import CardHeaderAuthSignUp from 'components/smart/Card/Header/Auth/SignUp';
import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import ButtonGoBackTo from 'components/dumb/Button/GoBack/To';
import FormFields from '@misakey/ui/Form/Fields';
import FieldText from 'components/dumb/Form/Field/Text';

// CONSTANTS
const FIELD = 'email';

const DEFAULT_FIELDS = {
  [FIELD]: { component: FieldText, type: 'email', inputProps: { 'data-matomo-ignore': true }, autoFocus: true },
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  buttonRoot: {
    [theme.breakpoints.up('sm')]: {
      width: 'auto',
    },
  },
  cardRoot: {
    maxWidth: 500,
    [theme.breakpoints.up('sm')]: {
      minWidth: 500,
    },
  },
}));

// COMPONENTS
const AuthSignUpCreateIdentifierFormFields = (fields) => (
  <FormFields fields={fields} prefix="signUp." defaultFields={DEFAULT_FIELDS} />
);

AuthSignUpCreateIdentifierFormFields.defaultProps = DEFAULT_FIELDS;

const AuthSignUpCreateIdentifier = ({
  t,
  setTouched,
  location: { search },
  dispatchSetCredentials,
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
      pathname: routes.auth.signUp.preamble,
      search,
    }),
    [search],
  );

  useEffect(
    () => {
      setTouched({ tos: true });
      dispatchSetCredentials('');
    },
    [dispatchSetCredentials, setTouched],
  );

  return (
    <Card
      className={classes.cardRoot}
      padded={padded}
      primary={primary}
      secondary={<ButtonGoBackTo to={parentTo} />}
      title={t('auth:signUp.create.identifier.title')}
      titleProps={titleProps}
      subtitle={t('auth:signUp.create.identifier.subtitle')}
      subtitleProps={subtitleProps}
      Header={CardHeaderAuthSignUp}
      formik
    >
      <AuthSignUpCreateIdentifierFormFields />
      <Button
        standing={BUTTON_STANDINGS.TEXT}
        to={routes.auth.signIn._}
        component={Link}
        text={t('auth:signUp.form.action.signIn')}
        classes={{ buttonRoot: classes.buttonRoot }}
      />
      {/* <Box mt={2}>
        <Typography>
          {t('auth:signUp.create.identifier.more.text')}
          <MUILink
            color="secondary"
            to={routes.legals.privacy}
            component={Link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('auth:signUp.create.identifier.more.link')}
          </MUILink>
        </Typography>
      </Box> */}
    </Card>
  );
};

AuthSignUpCreateIdentifier.propTypes = {
  // props
  dispatchSetCredentials: PropTypes.func.isRequired,
  // ROUTER
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  // FORMIK
  setTouched: PropTypes.func.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};


export default withTranslation(['auth', 'common'])(AuthSignUpCreateIdentifier);
