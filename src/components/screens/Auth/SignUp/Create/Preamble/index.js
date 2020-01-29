import React, { useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';

import routes from 'routes';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Typography from '@material-ui/core/Typography';
import Card from 'components/dumb/Card';
import CardHeaderAuthSignUp from 'components/smart/Card/Header/Auth/SignUp';
import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import ButtonGoBackTo from 'components/dumb/Button/GoBack/To';
import MUILink from '@material-ui/core/Link';

// CONSTANTS
const FIELD = 'tos';

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
}));

// COMPONENTS
const AuthSignUpPreamble = ({ t, setFieldValue, setFieldTouched, setTouched, isSubmitting }) => {
  const theme = useTheme();
  const padded = useMediaQuery(theme.breakpoints.up('sm'));

  const classes = useStyles();

  const onAccept = useCallback(
    () => {
      setFieldValue(FIELD, true);
      setFieldTouched(FIELD, true, false);
    },
    [setFieldTouched, setFieldValue],
  );

  const primary = useMemo(
    () => ({
      text: t('auth:signUp.create.preamble.action.accept'),
      isLoading: isSubmitting,
      type: 'submit',
      onClick: onAccept,
    }),
    [isSubmitting, onAccept, t],
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
      secondary={<ButtonGoBackTo to={routes.auth.signIn} />}
      Header={CardHeaderAuthSignUp}
      padded={padded}
    >
      <List>
        <ListItem classes={{ container: classes.listItemContainer }}>
          <ListItemText primary={t('auth:signUp.create.preamble.tos.text')} />
          <ListItemSecondaryAction>
            <Button
              text={t('auth:signUp.create.preamble.tos.button')}
              href={t('common:footer.links.tos.href')}
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
              href={t('common:footer.links.privacy.href')}
              target="_blank"
              rel="noopener noreferrer"
              standing={BUTTON_STANDINGS.TEXT}
            />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
      <Typography className={classes.contentTitleTypography} variant="body2">{t('auth:signUp.create.preamble.content.title')}</Typography>
      <Typography className={classes.contentTextTypography} variant="body2">
        <Trans
          i18nKey="auth:signUp.create.preamble.content.text"
        >
          {"Misakey connaît les sites avec lesquels je peux intéragir.<br/>Misakey n'a pas accès au contenu de mes échanges avec les sites.<br/><br/>Je peux envoyer mes questions et suggestions d'amélioration à "}
          <MUILink
            component="a"
            href="mailto:question.perso@misakey.com"
            color="secondary"
          >
            question.perso@misakey.com
          </MUILink>
        </Trans>
      </Typography>
    </Card>
  );
};

AuthSignUpPreamble.propTypes = {
  t: PropTypes.func.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  // FORMIK
  isSubmitting: PropTypes.bool.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  setFieldTouched: PropTypes.func.isRequired,
  setTouched: PropTypes.func.isRequired,
};

export default withTranslation(['auth', 'common'])(AuthSignUpPreamble);
