import React, { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Field } from 'formik';

import routes from 'routes';


import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Card from 'components/dumb/Card';
import CardHeaderAuthSignUp from 'components/smart/Card/Auth/Header/SignUp';
import ButtonGoBackTo from 'components/dumb/Button/GoBack/To';
import ChipUser from 'components/dumb/Chip/User';
import Box from '@material-ui/core/Box';
import FormFieldList from 'components/dumb/Form/Field/List';
import ListNotificationConfig from 'components/dumb/List/NotificationConfig';

// CONSTANTS
const FIELD = 'notifications';

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
const AuthSignUpCreateNotifications = ({
  t,
  values: { handle, email },
  setTouched,
  location: { search },
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

  const parentTo = useMemo(
    () => ({
      pathname: routes.auth.signUp.handle,
      search,
    }),
    [search],
  );

  useEffect(
    () => {
      setTouched({ tos: true, email: true, handle: true });
    },
    [setTouched],
  );

  return (
    <Card
      className={classes.cardRoot}
      padded={padded}
      secondary={<ButtonGoBackTo to={parentTo} />}
      title={t('auth:signUp.create.notifications.title')}
      titleProps={titleProps}
      subtitle={t('auth:signUp.create.notifications.subtitle')}
      subtitleProps={subtitleProps}
      Header={CardHeaderAuthSignUp}
      formik
    >
      <Box display="flex" justifyContent="center" mb={1}>
        <ChipUser
          label={email}
          displayName={handle}
        />
      </Box>
      <Field
        name={FIELD}
      >
        {(fieldProps) => (
          <FormFieldList
            component={ListNotificationConfig}
            {...fieldProps}
          />
        )}
      </Field>
    </Card>
  );
};

AuthSignUpCreateNotifications.propTypes = {
  // ROUTER
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  // FORMIK
  values: PropTypes.shape({
    email: PropTypes.string,
    handle: PropTypes.string,
  }).isRequired,
  setTouched: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  submitForm: PropTypes.func.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation(['auth__signup', 'common'])(AuthSignUpCreateNotifications);
