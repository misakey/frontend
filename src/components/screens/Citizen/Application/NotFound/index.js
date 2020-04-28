import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { useSnackbar } from 'notistack';

import { connect } from 'react-redux';
import { normalize } from 'normalizr';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';

import API from '@misakey/api';

import { IS_PLUGIN } from 'constants/plugin';

import getNextSearch from '@misakey/helpers/getNextSearch';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { receiveEntities } from '@misakey/store/actions/entities';
import ApplicationSchema from 'store/schemas/Application';

import routes from 'routes';

import Screen from 'components/dumb/Screen';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import CardSimpleText from 'components/dumb/Card/Simple/Text';
import LinkWithDialogConnect from 'components/smart/Dialog/Connect/with/Link';
import withDialogConnect from 'components/smart/Dialog/Connect/with';

// HOOKS
const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'center',
    height: 'inherit',
    textAlign: 'center',
    paddingBottom: theme.spacing(2),
  },
}));


// COMPONENTS
const ButtonWithDialogConnect = withDialogConnect(Button);

const APPLICATION_CREATE_ENDPOINT = {
  method: 'POST',
  path: '/application-info',
  auth: true,
};

const createApplication = (mainDomain) => API
  .use(APPLICATION_CREATE_ENDPOINT)
  .build(null, objectToSnakeCase({ mainDomain }))
  .send();

const useOnCreateApplication = (
  mainDomain,
  dispatchApplicationCreate,
  enqueueSnackbar,
  handleHttpErrors,
  t,
) => useCallback(() => createApplication(mainDomain)
  .then((response) => {
    const application = objectToCamelCase(response);
    enqueueSnackbar(t('citizen:applications.create.success'), { variant: 'success' });
    dispatchApplicationCreate(application);
  })
  .catch(handleHttpErrors),
[dispatchApplicationCreate, enqueueSnackbar, handleHttpErrors, mainDomain, t]);


function ApplicationNotFound({ mainDomain, dispatchApplicationCreate, t }) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();
  const onCreateApplication = useOnCreateApplication(
    mainDomain,
    dispatchApplicationCreate,
    enqueueSnackbar,
    handleHttpErrors,
    t,
  );

  const goToCreateApp = useMemo(() => ({
    pathname: routes.citizen.applications.create,
    search: getNextSearch('', new Map([['prefill', mainDomain]])),
  }), [mainDomain]);

  const buttonProps = useMemo(
    () => (IS_PLUGIN ? {
      component: ButtonWithDialogConnect,
      onClick: onCreateApplication,
    } : {
      component: LinkWithDialogConnect,
      to: goToCreateApp,
    }),
    [goToCreateApp, onCreateApplication],
  );

  return (
    <Screen>
      <Container maxWidth="md" className={classes.container}>
        <Box mb={1}>
          <Typography variant="h2" color="secondary">{404}</Typography>
        </Box>
        <Typography variant="h5" component="h3" color="textSecondary">
          {t('citizen:application.notFound.title', { mainDomain })}
        </Typography>
        <Box my={4}>
          <CardSimpleText
            my={1}
            text={t('citizen:application.notFound.create.text', { mainDomain })}
            button={{
              text: t('citizen:application.notFound.create.button'),
              standing: BUTTON_STANDINGS.MAIN,
              ...buttonProps,
            }}
          />
        </Box>
      </Container>
    </Screen>
  );
}

ApplicationNotFound.propTypes = {
  mainDomain: PropTypes.string.isRequired,
  dispatchApplicationCreate: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};
// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchApplicationCreate: (application) => {
    const normalized = normalize(application, ApplicationSchema.entity);
    const { entities } = normalized;
    dispatch(receiveEntities(entities));
  },
});

export default connect(null, mapDispatchToProps)(withTranslation(['citizen'])(ApplicationNotFound));
