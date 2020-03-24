import React, { useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import routes from 'routes';

import clsx from 'clsx';

import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Card from 'components/dumb/Card';
import CardHeaderAuthSignUp from 'components/smart/Card/Auth/Header/SignUp';
import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import ButtonGoBackTo from 'components/dumb/Button/GoBack/To';
import Switch from '@material-ui/core/Switch';

// CONSTANTS
const TOS_FIELD = 'tos';
const MISAKEY_KNOW_FIELD = 'misakeyKnow';
const MISAKEY_CRYPTO_FIELD = 'misakeyCrypto';

// HOOKS
const useStyles = makeStyles((theme) => ({
  contentTitleTypography: {
    fontWeight: 'bold',
  },
  contentTextTypography: {
    whiteSpace: 'pre-wrap',
  },
  cardRoot: {
    maxWidth: 500,
    [theme.breakpoints.up('sm')]: {
      minWidth: 500,
    },
  },
  listItemContainer: {
    margin: theme.spacing(1, 0),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  listItemContainerWithError: {
    borderColor: theme.palette.secondary.main,
  },
  listItemWithSwitch: {
    paddingRight: 66,
  },
}));

// COMPONENTS
const AuthSignUpPreamble = ({
  t, setFieldValue, setTouched, values, errors, touched,
}) => {
  const theme = useTheme();
  const padded = useMediaQuery(theme.breakpoints.up('sm'));

  const classes = useStyles();

  const onAccept = useCallback(
    () => {
      setFieldValue(TOS_FIELD, true);
      setTouched({
        [TOS_FIELD]: true,
        [MISAKEY_CRYPTO_FIELD]: true,
        [MISAKEY_KNOW_FIELD]: true,
      }, false);
    },
    [setTouched, setFieldValue],
  );

  const primary = useMemo(
    () => ({
      text: t('auth:signUp.create.preamble.action.accept'),
      type: 'submit',
      onClick: onAccept,
    }),
    [onAccept, t],
  );

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

  const hasKnowFieldError = useMemo(
    () => touched[MISAKEY_KNOW_FIELD] && !isNil(errors[MISAKEY_KNOW_FIELD]),
    [touched, errors],
  );

  const hasCryptoFieldError = useMemo(
    () => touched[MISAKEY_CRYPTO_FIELD] && !isNil(errors[MISAKEY_CRYPTO_FIELD]),
    [touched, errors],
  );

  const toggleMisakeyKnow = useCallback(
    (e) => setFieldValue(MISAKEY_KNOW_FIELD, e.target.checked),
    [setFieldValue],
  );

  const toggleMisakeyCrypto = useCallback(
    (e) => setFieldValue(MISAKEY_CRYPTO_FIELD, e.target.checked),
    [setFieldValue],
  );

  useEffect(
    () => {
      setTouched({});
    },
    [setTouched],
  );

  return (
    <Card
      className={classes.cardRoot}
      title={t('auth:signUp.create.preamble.title')}
      titleProps={titleProps}
      subtitle={t('auth:signUp.create.preamble.subtitle')}
      subtitleProps={subtitleProps}
      primary={primary}
      secondary={<ButtonGoBackTo to={routes.auth.signIn._} />}
      Header={CardHeaderAuthSignUp}
      padded={padded}
      formik
    >
      <List>
        <ListItem
          classes={{
            container: clsx(
              classes.listItemContainer,
              { [classes.listItemContainerWithError]: hasKnowFieldError },
            ),
            root: classes.listItemWithSwitch,
          }}
        >
          <ListItemText
            primary={t('auth:signUp.create.preamble.misakeyKnow')}
            primaryTypographyProps={{ variant: 'subtitle2' }}
          />
          <ListItemSecondaryAction>
            <Switch
              color="secondary"
              edge="end"
              onChange={toggleMisakeyKnow}
              checked={values[MISAKEY_KNOW_FIELD]}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem
          classes={{
            container: clsx(
              classes.listItemContainer,
              { [classes.listItemContainerWithError]: hasCryptoFieldError },
            ),
            root: classes.listItemWithSwitch,
          }}
        >
          <ListItemText
            primary={t('auth:signUp.create.preamble.misakeyCrypto')}
            primaryTypographyProps={{ variant: 'subtitle2' }}
          />
          <ListItemSecondaryAction>
            <Switch
              color="secondary"
              edge="end"
              onChange={toggleMisakeyCrypto}
              checked={values[MISAKEY_CRYPTO_FIELD]}
            />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
      <List>
        <ListItem classes={{ container: classes.listItemContainer }}>
          <ListItemText primary={t('auth:signUp.create.preamble.tos.text')} />
          <ListItemSecondaryAction>
            <Button
              text={t('auth:signUp.create.preamble.tos.button')}
              href={t('components:footer.links.tos.href')}
              target="_blank"
              rel="noopener noreferrer"
              standing={BUTTON_STANDINGS.TEXT}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem classes={{ container: classes.listItemContainer }}>
          <ListItemText primary={t('auth:signUp.create.preamble.privacy.text')} />
          <ListItemSecondaryAction>
            <Button
              text={t('auth:signUp.create.preamble.privacy.button')}
              href={t('components:footer.links.privacy.href')}
              target="_blank"
              rel="noopener noreferrer"
              standing={BUTTON_STANDINGS.TEXT}
            />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    </Card>
  );
};

AuthSignUpPreamble.propTypes = {
  t: PropTypes.func.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  // FORMIK
  setFieldValue: PropTypes.func.isRequired,
  setTouched: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
};

export default withTranslation(['auth', 'components'])(AuthSignUpPreamble);
