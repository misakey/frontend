import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';

import path from '@misakey/helpers/path';
import prop from '@misakey/helpers/prop';

import ApplicationSchema from 'store/schemas/Application';

import ButtonConnectSimple from 'components/dumb/Button/Connect/Simple';
import Title from 'components/dumb/Typography/Title';
import ScreenAction from 'components/dumb/Screen/Action';
import ApplicationAvatar from 'components/dumb/Avatar/Application';
import Card from 'components/dumb/Card';
import BoxEllipsis from 'components/dumb/Box/Ellipsis';
import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import ListQuestions, { useQuestionsItems } from 'components/dumb/List/Questions';

import { ROLE_PREFIX_SCOPE } from 'constants/Roles';
import { WORKSPACE } from 'constants/workspaces';

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import ChipUser from 'components/dumb/Chip/User';

// CONSTANTS
const QUESTIONS_TRANS_KEY = 'dpo:requests.access.questions';
const { DPO: DPO_WORKSPACE } = WORKSPACE;

// HELPERS
const getOwnerName = path(['owner', 'displayName']);
const dpoEmailProp = prop('dpoEmail');
const nameProp = prop('name');
const idProp = prop('id');

// HOOKS
const useStyles = makeStyles(() => ({
  buttonConnect: { padding: '5px 15px' },
  card: {
    height: '100%',
  },
  avatarParent: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
}));

// COMPONENTS
const AccessRequestChoose = ({
  accessRequest, error, isFetching, producer, t,
}) => {
  const classes = useStyles();
  const questionItems = useQuestionsItems(t, QUESTIONS_TRANS_KEY, 5);

  const navigationProps = useMemo(
    () => ({ showGoBack: false }),
    [],
  );

  const appBarProps = useMemo(
    () => ({
      withUser: false,
      withSearchBar: false,
      items: [(
        <BoxEllipsis className={classes.avatarParent} key="applicationAvatarParent">
          <ApplicationAvatar application={producer} />
        </BoxEllipsis>
      )],
    }),
    [classes.avatarParent, producer],
  );

  const state = useMemo(
    () => ({
      error,
      isLoading: isFetching,
    }),
    [error, isFetching],
  );

  const ownerName = useMemo(
    () => getOwnerName(accessRequest),
    [accessRequest],
  );

  const dpoEmail = useMemo(
    () => dpoEmailProp(accessRequest),
    [accessRequest],
  );

  const applicationName = useMemo(
    () => nameProp(producer),
    [producer],
  );

  const producerId = useMemo(
    () => idProp(producer),
    [producer],
  );

  const scope = useMemo(
    () => `openid user ${ROLE_PREFIX_SCOPE}.${DPO_WORKSPACE}.${producerId}`,
    [producerId],
  );

  return (
    <ScreenAction
      title={t('dpo:requests.access.title')}
      appBarProps={appBarProps}
      navigationProps={navigationProps}
      state={state}
    >
      <Container maxWidth="md">
        <Box mb={2} flexGrow={1} textAlign="justify">
          <Typography align="justify">
            <Trans
              i18nKey="dpo:requests.access.desc"
              values={{ ownerName, applicationName, dpoEmail }}
            >
              {'Cette interface est exclusivement réservée aux responsables du traitement des données de {{applicationName}}.'}
              <br />
              {'Elle permet d’assurer la chaîne de confiance lors du transfert des données de {{ownerName}}.'}
            </Trans>
          </Typography>
          <Box display="flex" justifyContent="center" mb={4}>
            <ChipUser identifier={ownerName} />
          </Box>
          <Grid container spacing={1}>
            <Grid item sm={6}>
              <Card className={classes.card}>
                <Box display="flex" justifyContent="center" mt={1}>
                  <Button
                    standing={BUTTON_STANDINGS.text}
                    authProps={{ scope, acrValues: 1, loginHint: dpoEmail }}
                    component={ButtonConnectSimple}
                    text={t('dpo:requests.access.passwordLess.button')}
                    aria-label={t('dpo:requests.access.passwordLess.button')}
                  />
                </Box>
                <Box p={1}>
                  <Typography align="center" variant="body2">
                    {t('dpo:requests.access.passwordLess.desc', { dpoEmail })}
                  </Typography>
                </Box>
              </Card>
            </Grid>
            <Grid item sm={6}>
              <Card className={classes.card}>
                <Box display="flex" justifyContent="center" mt={1}>
                  <Button
                    standing={BUTTON_STANDINGS.MAIN}
                    className={classes.buttonConnect}
                    component={ButtonConnectSimple}
                    text={t('dpo:requests.access.password.button')}
                    aria-label={t('dpo:requests.access.password.button')}
                  />
                </Box>
                <Box p={1}>
                  <Typography align="center" variant="body2">
                    {t('dpo:requests.access.password.desc')}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
        <Card>
          <CardContent>
            <Title>{t('dpo:requests.access.questions.title')}</Title>
          </CardContent>
          <ListQuestions items={questionItems} />
        </Card>
      </Container>
    </ScreenAction>
  );
};

AccessRequestChoose.propTypes = {
  accessRequest: PropTypes.shape({
    dpoEmail: PropTypes.string,
    owner: PropTypes.shape({
      email: PropTypes.string,
    }),
  }),
  error: PropTypes.instanceOf(Error),
  isFetching: PropTypes.bool.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
    hash: PropTypes.string.isRequired,
  }).isRequired,
  producer: PropTypes.shape(ApplicationSchema.propTypes),
  t: PropTypes.func.isRequired,
};

AccessRequestChoose.defaultProps = {
  accessRequest: null,
  error: null,
  producer: {},
};

export default withTranslation(['dpo'])(AccessRequestChoose);
