import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import path from '@misakey/helpers/path';
import prop from '@misakey/helpers/prop';
import clsx from 'clsx';

import ApplicationSchema from 'store/schemas/Application';

import ButtonConnectSimple from 'components/dumb/Button/Connect/Simple';
import Title from 'components/dumb/Typography/Title';
import Subtitle from 'components/dumb/Typography/Subtitle';
import ScreenAction from 'components/dumb/Screen/Action';
import ApplicationAvatar from 'components/dumb/Avatar/Application';
import Card from 'components/dumb/Card';
import BoxEllipsis from 'components/dumb/Box/Ellipsis';
import Button from 'components/dumb/Button';
import ListQuestions, { useQuestionsItems } from 'components/dumb/List/Questions';

import { ROLE_PREFIX_SCOPE } from 'constants/Roles';

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import MUILink from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';

// CONSTANTS
const QUESTIONS_TRANS_KEY = 'screens:accessRequest.choose.questions';

// HELPERS
const getOwnerEmail = path(['owner', 'email']);
const getOwnerName = path(['owner', 'display_name']);
const dpoEmailProp = prop('dpoEmail');
const nameProp = prop('name');
const idProp = prop('id');

// HOOKS
const useStyles = makeStyles((theme) => ({
  buttonConnect: { padding: '5px 15px' },
  p: { marginBottom: theme.spacing(2) },
  justify: { textAlign: 'justify' },
  gridItemLeft: {
    whiteSpace: 'pre-wrap',
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(0),
    [theme.breakpoints.up('sm')]: {
      paddingRight: theme.spacing(1.5),
    },
  },
  gridItemRight: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(0),
    [theme.breakpoints.up('sm')]: {
      paddingLeft: theme.spacing(1.5),
    },
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

  const ownerEmail = useMemo(
    () => getOwnerEmail(accessRequest),
    [accessRequest],
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
  const workspace = 'dpo';

  const scope = useMemo(
    () => `openid user ${ROLE_PREFIX_SCOPE}.${workspace}.${producerId}`,
    [producerId, workspace],
  );

  return (
    <ScreenAction
      title={t('screens:accessRequest.choose.title', { ownerName, ownerEmail })}
      appBarProps={appBarProps}
      navigationProps={navigationProps}
      state={state}
    >
      <Container maxWidth="md">
        <Card mb={2}>
          <CardContent>
            <Typography className={clsx(classes.p, classes.justify)}>
              {t('screens:accessRequest.choose.desc.0', { ownerName })}
            </Typography>
            <Typography className={clsx(classes.p, classes.justify)}>
              {t('screens:accessRequest.choose.desc.1', { ownerName })}
            </Typography>
            <Typography>
              {t('screens:accessRequest.choose.desc.2', { applicationName, dpoEmail })}
            </Typography>
            <Grid container>
              <Grid
                item
                sm={6}
                component={Box}
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
              >
                <Box display="flex" justifyContent="center" mt={1}>
                  <Button
                    standing="enhanced"
                    color="secondary"
                    authProps={{ scope, acrValues: 1, loginHint: dpoEmail }}
                    component={ButtonConnectSimple}
                    text={t('screens:accessRequest.choose.defaultDpoAccount.label')}
                    aria-label={t('screens:accessRequest.choose.defaultDpoAccount.label')}
                  />
                </Box>
                <Typography align="center" variant="body2" className={clsx(classes.gridItemLeft)}>
                  {t('screens:accessRequest.choose.desc.3', { dpoEmail })}
                </Typography>
              </Grid>
              <Grid
                item
                sm={6}
                component={Box}
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
              >
                <Box display="flex" justifyContent="center" mt={1}>
                  <Button
                    standing="main"
                    className={classes.buttonConnect}
                    component={ButtonConnectSimple}
                    text={t('screens:accessRequest.choose.userAccount.label')}
                  />
                </Box>
                <Typography align="center" variant="body2" className={clsx(classes.gridItemRight)}>
                  {t('screens:accessRequest.choose.desc.4')}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Title>{t('screens:accessRequest.choose.questions.title')}</Title>
            <Subtitle>
              <MUILink
                target="_blank"
                rel="nooppener noreferrer"
                href={t('links.docs.dpo')}
              >
                {t('screens:accessRequest.choose.questions.subtitle')}
              </MUILink>
            </Subtitle>
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

export default withTranslation(['common', 'screens'])(AccessRequestChoose);
